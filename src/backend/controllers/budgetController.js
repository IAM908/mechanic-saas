import pool from '../db/database.js'

const validItemTypes = ['part', 'labor', 'service']
const validDecisions = ['approved', 'rejected']

const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) >= 1

const getBudgetsByOrder = async (req, res) => {
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

    const revisionFilter =
      role === 'customer' ? `AND br.status <> 'pending_admin'` : ''

    const revisionsResult = await pool.query(
      `SELECT br.*, u.name AS created_by_name
       FROM budget_revisions br
       JOIN users u ON u.id = br.created_by
       WHERE br.work_order_id = $1 ${revisionFilter}
       ORDER BY br.version DESC`,
      [Number(workOrderId)]
    )

    if (revisionsResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      })
    }

    const revisionIds = revisionsResult.rows.map((r) => r.id)

    const itemsResult = await pool.query(
      `SELECT id, budget_revision_id, item_type, description, quantity, unit_price, total_price, created_at
       FROM work_order_items
       WHERE budget_revision_id = ANY($1)
       ORDER BY id ASC`,
      [revisionIds]
    )

    const approvalsResult = await pool.query(
      `SELECT ba.id, ba.budget_revision_id, ba.user_id, ba.approver_role, ba.decision, ba.comments, ba.decided_at,
              u.name AS approver_name
       FROM budget_approvals ba
       JOIN users u ON u.id = ba.user_id
       WHERE ba.budget_revision_id = ANY($1)
       ORDER BY ba.decided_at ASC`,
      [revisionIds]
    )

    const itemsByRevision = new Map()
    for (const item of itemsResult.rows) {
      const key = String(item.budget_revision_id)
      if (!itemsByRevision.has(key)) itemsByRevision.set(key, [])
      itemsByRevision.get(key).push(item)
    }

    const approvalsByRevision = new Map()
    for (const approval of approvalsResult.rows) {
      const key = String(approval.budget_revision_id)
      if (!approvalsByRevision.has(key)) approvalsByRevision.set(key, [])
      approvalsByRevision.get(key).push(approval)
    }

    const data = revisionsResult.rows.map((rev) => ({
      ...rev,
      items: itemsByRevision.get(String(rev.id)) || [],
      approvals: approvalsByRevision.get(String(rev.id)) || []
    }))

    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error al obtener presupuestos:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener los presupuestos.'
    })
  }
}

const createBudgetRevision = async (req, res) => {
  const { work_order_id, items } = req.body
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(work_order_id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID de la orden es obligatorio y debe ser válido.'
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debes enviar al menos un ítem para el presupuesto.'
    })
  }

  const normalizedItems = []
  let totalAmount = 0

  for (const item of items) {
    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unit_price)

    if (
      !validItemTypes.includes(item.item_type) ||
      typeof item.description !== 'string' ||
      !item.description.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cada ítem requiere item_type válido, descripción, cantidad mayor a 0 y precio unitario válido.',
        validItemTypes
      })
    }

    const totalPrice = Number((quantity * unitPrice).toFixed(2))
    totalAmount += totalPrice

    normalizedItems.push({
      item_type: item.item_type,
      description: item.description.trim(),
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    })
  }

  totalAmount = Number(totalAmount.toFixed(2))

  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const orderResult = await client.query(
      `SELECT id, mechanic_id, status
       FROM work_orders
       WHERE id = $1 AND business_id = $2`,
      [Number(work_order_id), businessId]
    )

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'La orden no existe en este taller.'
      })
    }

    const order = orderResult.rows[0]

    if (role === 'mechanic' && String(order.mechanic_id) !== String(userId)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(403).json({
        success: false,
        message: 'Solo el mecánico asignado a esta orden puede cotizar presupuestos.'
      })
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'No se pueden agregar presupuestos a una orden finalizada o cancelada.'
      })
    }

    const versionResult = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
       FROM budget_revisions
       WHERE work_order_id = $1`,
      [Number(work_order_id)]
    )

    const nextVersion = Number(versionResult.rows[0].next_version)

    const revisionResult = await client.query(
      `INSERT INTO budget_revisions (
        work_order_id,
        version,
        total_amount,
        status,
        created_by,
        created_at
      )
      VALUES ($1, $2, $3, 'pending_admin', $4, NOW())
      RETURNING *`,
      [Number(work_order_id), nextVersion, totalAmount, userId]
    )

    const revision = revisionResult.rows[0]
    const insertedItems = []

    for (const item of normalizedItems) {
      const itemResult = await client.query(
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
          revision.id,
          item.item_type,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price
        ]
      )
      insertedItems.push(itemResult.rows[0])
    }

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Presupuesto creado y enviado a revisión de administración.',
      data: {
        ...revision,
        items: insertedItems
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al crear presupuesto:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al crear el presupuesto.'
    })
  } finally {
    client.release()
  }
}

const reviewBudgetByAdmin = async (req, res) => {
  const { id } = req.params
  const { decision, comments } = req.body
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID del presupuesto no es válido.'
    })
  }

  if (!validDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: 'La decisión debe ser approved o rejected.'
    })
  }

  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const revisionResult = await client.query(
      `SELECT br.*
       FROM budget_revisions br
       JOIN work_orders wo ON wo.id = br.work_order_id
       WHERE br.id = $1 AND wo.business_id = $2
       FOR UPDATE`,
      [Number(id), businessId]
    )

    if (revisionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado en este taller.'
      })
    }

    const revision = revisionResult.rows[0]

    if (revision.status !== 'pending_admin') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `Este presupuesto ya fue procesado (estado actual: ${revision.status}).`
      })
    }

    const nextStatus = decision === 'approved' ? 'pending_client' : 'rejected'

    const updatedRevision = await client.query(
      `UPDATE budget_revisions
       SET status = $1,
           admin_reviewed_by = $2,
           admin_reviewed_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nextStatus, userId, Number(id)]
    )

    const approvalResult = await client.query(
      `INSERT INTO budget_approvals (
        budget_revision_id,
        user_id,
        approver_role,
        decision,
        comments,
        decided_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        Number(id),
        userId,
        role,
        decision,
        typeof comments === 'string' && comments.trim() ? comments.trim() : null
      ]
    )

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(200).json({
      success: true,
      message:
        decision === 'approved'
          ? 'Presupuesto confirmado y enviado al cliente.'
          : 'Presupuesto rechazado y devuelto al mecánico.',
      data: {
        revision: updatedRevision.rows[0],
        approval: approvalResult.rows[0]
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al revisar presupuesto:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al revisar el presupuesto.'
    })
  } finally {
    client.release()
  }
}

const respondBudgetByCustomer = async (req, res) => {
  const { id } = req.params
  const { decision, comments } = req.body
  const { business_id: businessId, id: userId, role } = req.user

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID del presupuesto no es válido.'
    })
  }

  if (!validDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: 'La decisión debe ser approved o rejected.'
    })
  }

  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const revisionResult = await client.query(
      `SELECT br.*
       FROM budget_revisions br
       JOIN work_orders wo ON wo.id = br.work_order_id
       JOIN customers c ON c.id = wo.customer_id
       WHERE br.id = $1 AND wo.business_id = $2 AND c.user_id = $3
       FOR UPDATE`,
      [Number(id), businessId, userId]
    )

    if (revisionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado para este cliente.'
      })
    }

    const revision = revisionResult.rows[0]

    if (revision.status !== 'pending_client') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `Este presupuesto no está pendiente de tu respuesta (estado actual: ${revision.status}).`
      })
    }

    const nextStatus = decision === 'approved' ? 'approved_client' : 'rejected'

    const updatedRevision = await client.query(
      `UPDATE budget_revisions
       SET status = $1,
           customer_responded_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [nextStatus, Number(id)]
    )

    const approvalResult = await client.query(
      `INSERT INTO budget_approvals (
        budget_revision_id,
        user_id,
        approver_role,
        decision,
        comments,
        decided_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        Number(id),
        userId,
        role,
        decision,
        typeof comments === 'string' && comments.trim() ? comments.trim() : null
      ]
    )

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(200).json({
      success: true,
      message:
        decision === 'approved'
          ? 'Presupuesto aprobado correctamente.'
          : 'Presupuesto rechazado correctamente.',
      data: {
        revision: updatedRevision.rows[0],
        approval: approvalResult.rows[0]
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al responder presupuesto:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar tu respuesta.'
    })
  } finally {
    client.release()
  }
}

export {
  getBudgetsByOrder,
  createBudgetRevision,
  reviewBudgetByAdmin,
  respondBudgetByCustomer
}