import pool from '../db/database.js'


const validStatuses = [
  'pending',
  'assigned',
  'in_progress',
  'paused',
  'waiting_parts',
  'waiting_approval',
  'review',
  'completed',
  'cancelled'
]

const allowedTransitions = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: [
    'paused',
    'waiting_parts',
    'waiting_approval',
    'review',
    'cancelled'
  ],
  paused: ['in_progress', 'cancelled'],
  waiting_parts: ['in_progress', 'cancelled'],
  waiting_approval: ['in_progress', 'cancelled'],
  review: ['in_progress', 'completed'],
  completed: [],
  cancelled: []
}

const getSessionById = async (sessionId, businessId) => {
  const result = await pool.query(
    `SELECT ws.*
     FROM work_sessions ws
     INNER JOIN work_orders wo
       ON wo.id = ws.work_order_id
     WHERE ws.id = $1
       AND wo.business_id = $2`,
    [sessionId, businessId]
  )

  return result.rows[0]
}

const createWorkSession = async (req, res) => {
  try {
    const { work_order_id, description } = req.body
    const businessId = req.user.business_id

    if (!work_order_id || !description?.trim()) {
      return res.status(400).json({
        message: 'La orden y la descripción son obligatorias.'
      })
    }

    const orderResult = await pool.query(
      `SELECT id
       FROM work_orders
       WHERE id = $1
         AND business_id = $2`,
      [work_order_id, businessId]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: 'La orden no existe en este taller.'
      })
    }

    const result = await pool.query(
      `INSERT INTO work_sessions (
        work_order_id,
        description,
        status,
        created_at
      )
      VALUES ($1, $2, 'pending', NOW())
      RETURNING *`,
      [work_order_id, description.trim()]
    )

    return res.status(201).json({
      message: 'Sesión creada correctamente.',
      session: result.rows[0]
    })
  } catch (error) {
    console.error('Error al crear la sesión:', error)

    return res.status(500).json({
      message: 'Error interno al crear la sesión.'
    })
  }
}

const getWorkSessions = async (req, res) => {
  try {
    const businessId = req.user.business_id
    const { work_order_id } = req.query

    const values = [businessId]

    let query = `
      SELECT ws.*
      FROM work_sessions ws
      INNER JOIN work_orders wo
        ON wo.id = ws.work_order_id
      WHERE wo.business_id = $1
    `

    if (work_order_id) {
      values.push(work_order_id)
      query += ` AND ws.work_order_id = $${values.length}`
    }

    query += ' ORDER BY ws.created_at DESC'

    const result = await pool.query(query, values)

    return res.status(200).json({
      sessions: result.rows
    })
  } catch (error) {
    console.error('Error al listar las sesiones:', error)

    return res.status(500).json({
      message: 'Error interno al listar las sesiones.'
    })
  }
}

const getWorkSessionById = async (req, res) => {
  try {
    const session = await getSessionById(
      req.params.id,
      req.user.business_id
    )

    if (!session) {
      return res.status(404).json({
        message: 'Sesión no encontrada.'
      })
    }

    return res.status(200).json({ session })
  } catch (error) {
    console.error('Error al consultar la sesión:', error)

    return res.status(500).json({
      message: 'Error interno al consultar la sesión.'
    })
  }
}

// PATCH /api/work-sessions/:id
const updateWorkSession = async (req, res) => {
  try {
    const sessionId = req.params.id
    const businessId = req.user.business_id

    const {
      description,
      mechanic_id,
      status
    } = req.body

    const session = await getSessionById(sessionId, businessId)

    if (!session) {
      return res.status(404).json({
        message: 'Sesión no encontrada.'
      })
    }

    if (
      session.status === 'completed' ||
      session.status === 'cancelled'
    ) {
      return res.status(400).json({
        message: 'La sesión ya terminó y no puede modificarse.'
      })
    }

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: 'Estado no válido.',
        validStatuses
      })
    }

    if (
      status !== undefined &&
      status !== session.status &&
      !allowedTransitions[session.status].includes(status)
    ) {
      return res.status(400).json({
        message: `Transición no permitida: ${session.status} → ${status}.`,
        allowedNextStatuses: allowedTransitions[session.status]
      })
    }

    if (
      description !== undefined &&
      (typeof description !== 'string' || !description.trim())
    ) {
      return res.status(400).json({
        message: 'La descripción no puede estar vacía.'
      })
    }

    if (
      mechanic_id !== undefined &&
      mechanic_id !== null &&
      (!Number.isInteger(Number(mechanic_id)) || Number(mechanic_id) <= 0)
    ) {
      return res.status(400).json({
        message: 'El identificador del mecánico no es válido.'
      })
    }

    const nextMechanicId =
      mechanic_id !== undefined
        ? mechanic_id
        : session.mechanic_id

    let nextStatus = status ?? session.status

    if (
      mechanic_id !== undefined &&
      mechanic_id !== null &&
      session.status === 'pending' &&
      status === undefined
    ) {
      nextStatus = 'assigned'
    }

    if (
      nextStatus === 'assigned' &&
      !nextMechanicId
    ) {
      return res.status(400).json({
        message: 'Debes asignar un mecánico para pasar a assigned.'
      })
    }

    if (
      nextStatus !== session.status &&
      !allowedTransitions[session.status].includes(nextStatus)
    ) {
      return res.status(400).json({
        message: `Transición no permitida: ${session.status} → ${nextStatus}.`,
        allowedNextStatuses: allowedTransitions[session.status]
      })
    }

    const fields = []
    const values = []

    const addField = (column, value) => {
      values.push(value)
      fields.push(`${column} = $${values.length}`)
    }

    if (description !== undefined) {
      addField('description', description.trim())
    }

    if (mechanic_id !== undefined) {
      addField('mechanic_id', mechanic_id)
    }

    if (nextStatus !== session.status) {
      addField('status', nextStatus)
    }

    if (
      nextStatus === 'in_progress' &&
      !session.started_at
    ) {
      fields.push('started_at = NOW()')
    }

    if (
      nextStatus === 'completed' ||
      nextStatus === 'cancelled'
    ) {
      fields.push('ended_at = NOW()')
    } else if (nextStatus !== session.status) {
      fields.push('ended_at = NULL')
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: 'No se proporcionaron cambios.'
      })
    }

    values.push(sessionId)
    const sessionPosition = values.length

    values.push(businessId)
    const businessPosition = values.length

    const result = await pool.query(
      `UPDATE work_sessions AS ws
       SET ${fields.join(', ')}
       FROM work_orders AS wo
       WHERE ws.id = $${sessionPosition}
         AND ws.work_order_id = wo.id
         AND wo.business_id = $${businessPosition}
       RETURNING ws.*`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'No se pudo encontrar la sesión.'
      })
    }

    return res.status(200).json({
      message: 'Sesión actualizada correctamente.',
      session: result.rows[0]
    })
  } catch (error) {
    console.error('Error al actualizar la sesión:', error)

    return res.status(500).json({
      message: 'Error interno al actualizar la sesión.'
    })
  }
}

const finishWorkSession = async (req, res) => {
  try {
    const session = await getSessionById(
      req.params.id,
      req.user.business_id
    )

    if (!session) {
      return res.status(404).json({
        message: 'Sesión no encontrada.'
      })
    }

    if (session.status !== 'review') {
      return res.status(400).json({
        message: 'La sesión debe estar en revisión antes de completarse.',
        currentStatus: session.status
      })
    }

    const result = await pool.query(
      `UPDATE work_sessions AS ws
       SET status = 'completed',
           ended_at = NOW()
       FROM work_orders AS wo
       WHERE ws.id = $1
         AND ws.work_order_id = wo.id
         AND wo.business_id = $2
         AND ws.status = 'review'
       RETURNING ws.*`,
      [req.params.id, req.user.business_id]
    )

    if (result.rows.length === 0) {
      return res.status(409).json({
        message: 'La sesión cambió de estado. Consulta su estado actual.'
      })
    }

    return res.status(200).json({
      message: 'Sesión completada correctamente.',
      session: result.rows[0]
    })
  } catch (error) {
    console.error('Error al finalizar la sesión:', error)

    return res.status(500).json({
      message: 'Error interno al finalizar la sesión.'
    })
  }
}

module.exports = {
  createWorkSession,
  getWorkSessions,
  getWorkSessionById,
  updateWorkSession,
  finishWorkSession
}
