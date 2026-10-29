import pool from '../db/database.js'

export const getNotification = async (req, res) => {
    try{
        const result = await pool.query(
            `SELECT id, title, message, type, read, created_at
            FROM notifications
            WHERE user_id = $1 
            ORDER BY created_at DESC`, [req.user.id]
        )

        res.status(200).json({notifications: result.rows})
    }catch(error){
        console.error('Error al obtener las notificaciones')
        res.status(500).json({
            message: 'Error al conseguir las notificaciones'
        })
    }
}

export const getUnreadCounter = async (req,res) => {
    try{ 
        const result = await pool.query(
            `SELECT COUNT (*) AS count 
            FROM notifications 
            WHERE user_id = $1 NAD read = FALSE`, [req.user.id]
        )
        res.status(200).json({
            unreadCount:Number(result.rows[0].count)
        })
    }catch(error){
        console.error('Error al contar las notificaciones')
        res.status.json(500)({
            message: 'Error al contar las notificaciones'
        })
    }
}

export const markNotificationsAsRead = async (req,res) => {
    try{
        const {id} = req.params
        const result = await pool.query(
            `UPDATE notifications
            SET read = TRUE
            WHERE id = $1 AND user_id = $2`, [
                id, req.user.id
            ]
        )

        if (result.rowCount === 0){
            return res.status(404).json({
                message: 'Notification no encontrada'
            })
        }

        res.status(200).json({
            notification: result.rows[0]
        })
    }catch(error){
        console.error('Error al marcar notificacion como leida')
        res.status(500).json({
            message: 'Error al marcar la notificacion como leida'
        })
    }
}

export const markAllAsRead = async(req,res) => {
    try{
        const result = await pool.query(
                `UPDATE notifications SET read = TRUE
                WHERE user_id = $1 AND read = FALSE`, [req.user.id]
        )

        res.status(200).json({
            message: 'Notificationes marcadas como leidas',
            updatedCount: result.rowCount
        })
    }catch(error){
        console.error('Error al marcar todas las notificaciones como leidas')
    }
}