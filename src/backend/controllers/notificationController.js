import pool from '../db/database.js'

export const getNotification = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [req.user.id]
        )

        res.status(200).json({
            notifications: result.rows
        })

    } catch (error) {
        console.error('Error al obtener las notificaciones:', error)

        res.status(500).json({
            message: 'Error al obtener las notificaciones'
        })
    }
}

export const getUnreadCounter = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS count
            FROM notifications
            WHERE user_id = $1
            AND is_read = FALSE`,
            [req.user.id]
        )

        res.status(200).json({
            unreadCount: Number(result.rows[0].count)
        })

    } catch (error) {
        console.error('Error al contar las notificaciones:', error)

        res.status(500).json({
            message: 'Error al contar las notificaciones'
        })
    }
}

export const markNotificationsAsRead = async (req, res) => {
    try {
        const { id } = req.params

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: 'ID de notificación inválido'
            })
        }

        const result = await pool.query(
            `UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            AND user_id = $2
            RETURNING id, title, message, is_read, created_at`,
            [id, req.user.id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Notificación no encontrada'
            })
        }

        res.status(200).json({
            message: 'Notificación marcada como leída',
            notification: result.rows[0]
        })

    } catch (error) {
        console.error('Error al marcar la notificación como leída:', error)

        res.status(500).json({
            message: 'Error al marcar la notificación como leída'
        })
    }
}

export const markAllAsRead = async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1
            AND is_read = FALSE`,
            [req.user.id]
        )

        res.status(200).json({
            message: 'Todas las notificaciones fueron marcadas como leídas',
            updatedCount: result.rowCount
        })

    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error)

        res.status(500).json({
            message: 'Error al marcar todas las notificaciones como leídas'
        })
    }
}