import pool from '../db/database.js'

const getAdminDashboard = async (businessId) => {
  const [
    ordersMetricsResult,
    budgetsMetricsResult,
    paymentsMetricsResult,
    recentOrdersResult,
    priorityItemsResult,
    recentActivityResult
  ] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) NOT IN ('completed', 'cancelled'))::int AS active_orders,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'in_progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) IN ('paused', 'waiting_parts', 'waiting_approval'))::int AS waiting,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'review')::int AS in_review,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'completed')::int AS completed
       FROM work_orders wo
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE br.status = 'pending_admin')::int AS pending_admin,
         COUNT(*) FILTER (WHERE br.status = 'pending_client')::int AS pending_client,
         COUNT(*) FILTER (WHERE br.status = 'approved_client')::int AS approved_client,
         COALESCE(SUM(br.total_amount) FILTER (WHERE br.status = 'approved_client'), 0) AS total_authorized
       FROM budget_revisions br
       JOIN work_orders wo ON wo.id = br.work_order_id
       WHERE wo.business_id = $1
         AND wo.status <> 'cancelled'`,
      [businessId]
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS payments_count,
         COALESCE(SUM(amount), 0) AS total_paid
       FROM payments
       WHERE business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT
         wo.id,
         wo.description,
         COALESCE(ls.status, wo.status) AS status,
         wo.created_at,
         c.name AS customer_name,
         v.brand,
         v.model,
         v.year,
         v.plate,
         u.name AS mechanic_name,
         (
           SELECT COUNT(*)::int
           FROM budget_revisions br
           WHERE br.work_order_id = wo.id AND br.status = 'pending_admin'
         ) AS pending_admin_budgets,
         (
           SELECT COALESCE(SUM(br.total_amount), 0)
           FROM budget_revisions br
           WHERE br.work_order_id = wo.id AND br.status = 'approved_client'
         ) AS total_authorized
       FROM work_orders wo
       JOIN customers c ON c.id = wo.customer_id
       JOIN vehicles v ON v.id = wo.vehicle_id
       LEFT JOIN users u ON u.id = wo.mechanic_id
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1
       ORDER BY wo.created_at DESC
       LIMIT 5`,
      [businessId]
    ),
    pool.query(
      `SELECT
         wo.id,
         COALESCE(ls.status, wo.status) AS status,
         v.brand,
         v.model,
         v.plate,
         u.name AS mechanic_name,
         (
           SELECT COUNT(*)::int
           FROM budget_revisions br
           WHERE br.work_order_id = wo.id AND br.status = 'pending_admin'
         ) AS pending_admin_budgets
       FROM work_orders wo
       JOIN vehicles v ON v.id = wo.vehicle_id
       LEFT JOIN users u ON u.id = wo.mechanic_id
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1
         AND (
           COALESCE(ls.status, wo.status) IN ('waiting_parts', 'waiting_approval', 'paused', 'review')
           OR EXISTS (
             SELECT 1
             FROM budget_revisions br
             WHERE br.work_order_id = wo.id AND br.status = 'pending_admin'
           )
         )
       ORDER BY wo.updated_at DESC NULLS LAST, wo.created_at DESC
       LIMIT 5`,
      [businessId]
    ),
    pool.query(
      `SELECT *
       FROM (
         SELECT
           'budget_created' AS event_type,
           br.work_order_id,
           u.name AS actor_name,
           'Presupuesto v' || br.version || ' creado' AS detail,
           br.total_amount AS amount,
           br.created_at AS occurred_at
         FROM budget_revisions br
         JOIN work_orders wo ON wo.id = br.work_order_id
         JOIN users u ON u.id = br.created_by
         WHERE wo.business_id = $1

         UNION ALL

         SELECT
           'budget_' || ba.decision AS event_type,
           br.work_order_id,
           u.name AS actor_name,
           'Presupuesto v' || br.version || ' ' || ba.decision || ' (' || ba.approver_role || ')' AS detail,
           br.total_amount AS amount,
           ba.decided_at AS occurred_at
         FROM budget_approvals ba
         JOIN budget_revisions br ON br.id = ba.budget_revision_id
         JOIN work_orders wo ON wo.id = br.work_order_id
         JOIN users u ON u.id = ba.user_id
         WHERE wo.business_id = $1

         UNION ALL

         SELECT
           'payment_recorded' AS event_type,
           p.work_order_id,
           u.name AS actor_name,
           'Pago registrado (' || p.payment_method || ')' AS detail,
           p.amount AS amount,
           p.created_at AS occurred_at
         FROM payments p
         JOIN users u ON u.id = p.recorded_by
         WHERE p.business_id = $1
       ) AS activity
       ORDER BY occurred_at DESC
       LIMIT 10`,
      [businessId]
    )
  ])

  const ordersStats = ordersMetricsResult.rows[0]
  const budgetsStats = budgetsMetricsResult.rows[0]
  const paymentsStats = paymentsMetricsResult.rows[0]

  const totalAuthorized = Number(Number(budgetsStats.total_authorized).toFixed(2))
  const totalPaid = Number(Number(paymentsStats.total_paid).toFixed(2))
  const pendingBalance = Number(Math.max(0, totalAuthorized - totalPaid).toFixed(2))

  return {
    scope: 'admin',
    stats: {
      active_orders: ordersStats.active_orders,
      in_progress: ordersStats.in_progress,
      waiting: ordersStats.waiting,
      in_review: ordersStats.in_review,
      completed: ordersStats.completed,
      pending_admin_budgets: budgetsStats.pending_admin,
      pending_client_budgets: budgetsStats.pending_client,
      approved_client_budgets: budgetsStats.approved_client,
      total_authorized: totalAuthorized,
      total_paid: totalPaid,
      pending_balance: pendingBalance,
      payments_count: paymentsStats.payments_count
    },
    recent_orders: recentOrdersResult.rows,
    priority_items: priorityItemsResult.rows,
    recent_activity: recentActivityResult.rows
  }
}

const getMechanicDashboard = async (businessId, mechanicId) => {
  const [
    mechanicMetricsResult,
    recentOrdersResult,
    priorityItemsResult,
    recentActivityResult
  ] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) NOT IN ('completed', 'cancelled'))::int AS assigned_active,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'in_progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) IN ('paused', 'waiting_parts', 'waiting_approval'))::int AS waiting,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'review')::int AS in_review,
         COUNT(*) FILTER (WHERE COALESCE(ls.status, wo.status) = 'completed')::int AS completed
       FROM work_orders wo
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1
         AND wo.mechanic_id = $2`,
      [businessId, mechanicId]
    ),
    pool.query(
      `SELECT
         wo.id,
         wo.description,
         COALESCE(ls.status, wo.status) AS status,
         wo.created_at,
         c.name AS customer_name,
         v.brand,
         v.model,
         v.year,
         v.plate
       FROM work_orders wo
       JOIN customers c ON c.id = wo.customer_id
       JOIN vehicles v ON v.id = wo.vehicle_id
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1
         AND wo.mechanic_id = $2
       ORDER BY wo.created_at DESC
       LIMIT 5`,
      [businessId, mechanicId]
    ),
    pool.query(
      `SELECT
         wo.id,
         COALESCE(ls.status, wo.status) AS status,
         v.brand,
         v.model,
         v.plate
       FROM work_orders wo
       JOIN vehicles v ON v.id = wo.vehicle_id
       LEFT JOIN LATERAL (
         SELECT ws.status
         FROM work_sessions ws
         WHERE ws.work_order_id = wo.id
         ORDER BY ws.created_at DESC, ws.id DESC
         LIMIT 1
       ) ls ON TRUE
       WHERE wo.business_id = $1
         AND wo.mechanic_id = $2
         AND COALESCE(ls.status, wo.status) IN ('waiting_parts', 'waiting_approval', 'paused', 'review')
       ORDER BY wo.updated_at DESC NULLS LAST, wo.created_at DESC
       LIMIT 5`,
      [businessId, mechanicId]
    ),
    pool.query(
      `SELECT *
       FROM (
         SELECT
           'budget_created' AS event_type,
           br.work_order_id,
           u.name AS actor_name,
           'Presupuesto v' || br.version || ' creado' AS detail,
           br.total_amount AS amount,
           br.created_at AS occurred_at
         FROM budget_revisions br
         JOIN work_orders wo ON wo.id = br.work_order_id
         JOIN users u ON u.id = br.created_by
         WHERE wo.business_id = $1
           AND wo.mechanic_id = $2

         UNION ALL

         SELECT
           'budget_' || ba.decision AS event_type,
           br.work_order_id,
           u.name AS actor_name,
           'Presupuesto v' || br.version || ' ' || ba.decision || ' (' || ba.approver_role || ')' AS detail,
           br.total_amount AS amount,
           ba.decided_at AS occurred_at
         FROM budget_approvals ba
         JOIN budget_revisions br ON br.id = ba.budget_revision_id
         JOIN work_orders wo ON wo.id = br.work_order_id
         JOIN users u ON u.id = ba.user_id
         WHERE wo.business_id = $1
           AND wo.mechanic_id = $2
       ) AS activity
       ORDER BY occurred_at DESC
       LIMIT 10`,
      [businessId, mechanicId]
    )
  ])

  return {
    scope: 'mechanic',
    stats: mechanicMetricsResult.rows[0],
    recent_orders: recentOrdersResult.rows,
    priority_items: priorityItemsResult.rows,
    recent_activity: recentActivityResult.rows
  }
}

const getDashboardSummary = async (req, res) => {
  try {
    const { business_id: businessId, role, id: userId } = req.user

    const data =
      role === 'mechanic'
        ? await getMechanicDashboard(businessId, userId)
        : await getAdminDashboard(businessId)

    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error al obtener el resumen del dashboard:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al cargar el resumen del taller.'
    })
  }
}

export { getDashboardSummary }