import pool from '../db/database.js'

const methodAliases = {
  cash: 'cash',
  efectivo: 'cash',
  transfer: 'transfer',
  transferencia: 'transfer',
  card: 'card',
  tarjeta: 'card'
}

const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) >= 1

const getOrderFinancialSummary = async (dbClient, workOrderId) => {
  const authorizedResult = await dbClient.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS total_authorized
     FROM budget_revisions
     WHERE work_order_id = $1 AND status = 'approved_client'`,
    [Number(workOrderId)]
  )

  const paidResult = await dbClient.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_paid
     FROM payments
     WHERE work_order_id = $1`,
    [Number(workOrderId)]
  )

  const totalAuthorized = Number(Number(authorizedResult.rows[0].total_authorized).toFixed(2))
  const totalPaid = Number(Number(paidResult.rows[0].total_paid).toFixed(2))
  const balance = Number(Math.max(0, totalAuthorized - totalPaid).toFixed(2))

  return {
    total_authorized: totalAuthorized,
    total_paid: totalPaid,
    balance
  }
}

const getPaymentsByOrder = async (req, res) => {
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

    const summary = await getOrderFinancialSummary(pool, workOrderId)

    const paymentsResult = await pool.query(
      `SELECT p.id, p.work_order_id, p.amount, p.payment_method, p.created_at,
              u.name AS recorded_by_name
       FROM payments p
       JOIN users u ON u.id = p.recorded_by
       WHERE p.work_order_id = $1 AND p.business_id = $2
       ORDER BY p.created_at DESC`,
      [Number(workOrderId), businessId]
    )

    return res.status(200).json({
      success: true,
      data: {
        summary,
        payments: paymentsResult.rows
      }
    })
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener los pagos.'
    })
  }
}

const createPayment = async (req, res) => {
  const { work_order_id, amount, payment_method } = req.body
  const { business_id: businessId, id: userId } = req.user

  if (!isValidId(work_order_id)) {
    return res.status(400).json({
      success: false,
      message: 'El ID de la orden es obligatorio y debe ser válido.'
    })
  }

  const parsedAmount = Number(amount)
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El monto del pago debe ser mayor a 0.'
    })
  }

  const normalizedMethod =
    typeof payment_method === 'string'
      ? methodAliases[payment_method.trim().toLowerCase()]
      : undefined

  if (!normalizedMethod) {
    return res.status(400).json({
      success: false,
      message: 'Método de pago no válido. Usa cash, transfer o card.'
    })
  }

  const cleanAmount = Number(parsedAmount.toFixed(2))
  const client = await pool.connect()
  let transactionStarted = false

  try {
    await client.query('BEGIN')
    transactionStarted = true

    const orderResult = await client.query(
      `SELECT id, status
       FROM work_orders
       WHERE id = $1 AND business_id = $2
       FOR UPDATE`,
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

    if (orderResult.rows[0].status === 'cancelled') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'No se pueden registrar pagos en una orden cancelada.'
      })
    }

    const currentSummary = await getOrderFinancialSummary(client, work_order_id)

    if (currentSummary.total_authorized <= 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'La orden aún no tiene presupuestos aprobados por el cliente.'
      })
    }

    if (currentSummary.balance <= 0) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya está saldada en su totalidad.'
      })
    }

    if (cleanAmount > currentSummary.balance) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(400).json({
        success: false,
        message: `El monto excede el balance pendiente (${currentSummary.balance}).`,
        balance: currentSummary.balance
      })
    }

    const paymentResult = await client.query(
      `INSERT INTO payments (
        business_id,
        work_order_id,
        amount,
        payment_method,
        recorded_by,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [businessId, Number(work_order_id), cleanAmount, normalizedMethod, userId]
    )

    const updatedSummary = await getOrderFinancialSummary(client, work_order_id)

    await client.query('COMMIT')
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Pago registrado correctamente.',
      data: {
        payment: paymentResult.rows[0],
        summary: updatedSummary
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK')
    }
    console.error('Error al registrar pago:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el pago.'
    })
  } finally {
    client.release()
  }
}

export {
  getPaymentsByOrder,
  createPayment
}