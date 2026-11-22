import pool from '../db/database.js'

const validItemTypes = ['part', 'labor', 'service']

const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) >= 1

const recalculateRevisionTotal = async (dbClient, revisionId) => {
  const sumResult = await dbClient.query(
    `SELECT COALESCE(SUM(total_price), 0) AS new_total
     FROM work_order_items
     WHERE budget_revision_id = $1`,
    [Number(revisionId)]
  )

  const newTotal = Number(Number(sumResult.rows[0].new_total).toFixed(2))

  const updatedRevision = await dbClient.query(
    `UPDATE budget_revisions
     SET total_amount = $1
     WHERE id = $2
     RETURNING id, work_order_id, version, total_amount, status`,
    [newTotal, Number(revisionId)]
  )

  return updatedRevision.rows[0]
}

const getItemsByOrder = async (req, res) => {
  try {
    const { workOrderId } = req.params
    const { business_id: businessId, role, id: userId } = req.user

    if (!isValidId(workOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la orden no es válido.'
      })
    }

    const orderQuery =
      role === 'customer'
        ? `SELECT wo.id
           FROM work_orders wo
           JOIN customers c ON c.id = wo.customer_id
           WHERE wo.id = $1 AND wo.business_id = $2 AND c.user_id = $3`
        : `SELECT id
           FROM work_orders
           WHERE id = $1 AND business_id = $2`

    const orderParams =
      role === 'customer'
        ? [Number(workOrderId), businessId, userId]
        : [Number(workOrderId), businessId]

    const orderCheck = await pool.query(orderQuery, orderParams)

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden de trabajo no encontrada.'
      })
    }

    const statusFilter =
      role === 'customer' ? `AND br.status <> 'pending_admin'` : ''

    const itemsResult = await pool.query(
      `SELECT woi.id, woi.budget_revision_id, woi.item_type, woi.description,
              woi.quantity, woi.unit_price, woi.total_price, woi.created_at,
              br.version AS revision_version, br.status AS revision_status
       FROM work_order_items woi
       JOIN budget_revisions br ON br.id = woi.budget_revision_id
       WHERE br.work_order_id = $1 ${statusFilter}
       ORDER BY br.version DESC, woi.id ASC`,
      [Number(workOrderId)]
    )

    return res.status(200).json({
      success: true,
      data: itemsResult.rows
    })
  } catch (error) {
    console.error('Error al obtener ítems de la orden:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener los ítems.'
    })
  }
}

const addItemToRevision = async (req, res) => {
  const { budget_revision_id, item_type, description, quantity, unit_price } = req.body
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(budget_revision_id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID de la revisión de presupuesto no es válido.'
    })
  }

  const parsedQuantity = Number(quantity)
  const parsedUnitPrice = Number(unit_price)

  if (
    !validItemTypes.includes(item_type) ||
    typeof description !== 'string' ||
    !description.trim() ||
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity <= 0 ||
    !Number.isFinite(parsedUnitPrice) ||
    parsedUnitPrice < 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Datos del ítem inválidos. Verifica tipo, descripción, cantidad y precio unitario.',
      validItemTypes
    })
  }

  const totalPrice = Number((parsedQuantity * parsedUnitPrice).toFixed(2))
  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const revisionResult = await client.query(
      `SELECT br.id, br.status, wo.mechanic_id
       FROM budget_revisions br
       JOIN work_orders wo ON wo.id = br.work_order_id
       WHERE br.id = $1 AND wo.business_id = $2
       FOR UPDATE OF br`,
      [Number(budget_revision_id), businessId]
    )

    if (revisionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'Revisión de presupuesto no encontrada en este taller.'
      })
    }

    const revision = revisionResult.rows[0]

    if (role === 'mechanic' && String(revision.mechanic_id) !== String(userId)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(403).json({
        success: false,
        message: 'Solo el mecánico asignado puede modificar ítems de esta orden.'
      })
    }

    if (revision.status !== 'pending_admin') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `No se pueden agregar ítems cuando el presupuesto está en estado ${revision.status}.`
      })
    }

    const insertResult = await client.query(
      `INSERT INTO work_order_items (
        budget_revision_id,
        item_type,
        description,
        quantity,
        unit_price,
        total_price,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [
        Number(budget_revision_id),
        item_type,
        description.trim(),
        parsedQuantity,
        parsedUnitPrice,
        totalPrice
      ]
    )

    const updatedRevision = await recalculateRevisionTotal(client, budget_revision_id)

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Ítem agregado y total recalculado.',
      data: {
        item: insertResult.rows[0],
        revision: updatedRevision
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al agregar ítem:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al agregar el ítem.'
    })
  } finally {
    client.release()
  }
}

const updateWorkOrderItem = async (req, res) => {
  const { id } = req.params
  const { item_type, description, quantity, unit_price } = req.body
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID del ítem no es válido.'
    })
  }

  if (
    item_type === undefined &&
    description === undefined &&
    quantity === undefined &&
    unit_price === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Debes enviar al menos un campo para actualizar.'
    })
  }

  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const itemResult = await client.query(
      `SELECT woi.*, br.status AS revision_status, wo.mechanic_id
       FROM work_order_items woi
       JOIN budget_revisions br ON br.id = woi.budget_revision_id
       JOIN work_orders wo ON wo.id = br.work_order_id
       WHERE woi.id = $1 AND wo.business_id = $2
       FOR UPDATE OF woi, br`,
      [Number(id), businessId]
    )

    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado en este taller.'
      })
    }

    const currentItem = itemResult.rows[0]

    if (role === 'mechanic' && String(currentItem.mechanic_id) !== String(userId)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(403).json({
        success: false,
        message: 'Solo el mecánico asignado puede editar este ítem.'
      })
    }

    if (currentItem.revision_status !== 'pending_admin') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `El presupuesto ya no es editable (estado actual: ${currentItem.revision_status}).`
      })
    }

    const nextType = item_type !== undefined ? item_type : currentItem.item_type
    const nextDescription =
      description !== undefined ? description : currentItem.description
    const nextQuantity =
      quantity !== undefined ? Number(quantity) : Number(currentItem.quantity)
    const nextUnitPrice =
      unit_price !== undefined ? Number(unit_price) : Number(currentItem.unit_price)

    if (
      !validItemTypes.includes(nextType) ||
      typeof nextDescription !== 'string' ||
      !nextDescription.trim() ||
      !Number.isFinite(nextQuantity) ||
      nextQuantity <= 0 ||
      !Number.isFinite(nextUnitPrice) ||
      nextUnitPrice < 0
    ) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'Los valores actualizados del ítem no son válidos.'
      })
    }

    const nextTotalPrice = Number((nextQuantity * nextUnitPrice).toFixed(2))

    const updatedItemResult = await client.query(
      `UPDATE work_order_items
       SET item_type = $1,
           description = $2,
           quantity = $3,
           unit_price = $4,
           total_price = $5
       WHERE id = $6
       RETURNING *`,
      [
        nextType,
        nextDescription.trim(),
        nextQuantity,
        nextUnitPrice,
        nextTotalPrice,
        Number(id)
      ]
    )

    const updatedRevision = await recalculateRevisionTotal(
      client,
      currentItem.budget_revision_id
    )

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(200).json({
      success: true,
      message: 'Ítem actualizado correctamente.',
      data: {
        item: updatedItemResult.rows[0],
        revision: updatedRevision
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al actualizar ítem:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el ítem.'
    })
  } finally {
    client.release()
  }
}

const deleteWorkOrderItem = async (req, res) => {
  const { id } = req.params
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID del ítem no es válido.'
    })
  }

  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const itemResult = await client.query(
      `SELECT woi.id, woi.budget_revision_id, br.status AS revision_status, wo.mechanic_id
       FROM work_order_items woi
       JOIN budget_revisions br ON br.id = woi.budget_revision_id
       JOIN work_orders wo ON wo.id = br.work_order_id
       WHERE woi.id = $1 AND wo.business_id = $2
       FOR UPDATE OF woi, br`,
      [Number(id), businessId]
    )

    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado en este taller.'
      })
    }

    const target = itemResult.rows[0]

    if (role === 'mechanic' && String(target.mechanic_id) !== String(userId)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(403).json({
        success: false,
        message: 'Solo el mecánico asignado puede eliminar ítems de esta orden.'
      })
    }

    if (target.revision_status !== 'pending_admin') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `No se pueden eliminar ítems en estado ${target.revision_status}.`
      })
    }

    const countResult = await client.query(
      `SELECT COUNT(*) AS item_count
       FROM work_order_items
       WHERE budget_revision_id = $1`,
      [target.budget_revision_id]
    )

    if (Number(countResult.rows[0].item_count) <= 1) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'Un presupuesto debe conservar al menos un ítem.'
      })
    }

    await client.query(
      'DELETE FROM work_order_items WHERE id = $1',
      [Number(id)]
    )

    const updatedRevision = await recalculateRevisionTotal(
      client,
      target.budget_revision_id
    )

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(200).json({
      success: true,
      message: 'Ítem eliminado y total recalculado.',
      data: {
        deleted_item_id: Number(id),
        revision: updatedRevision
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al eliminar ítem:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el ítem.'
    })
  } finally {
    client.release()
  }
}

export {
  getItemsByOrder,
  addItemToRevision,
  updateWorkOrderItem,
  deleteWorkOrderItem
}