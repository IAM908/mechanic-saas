import express from 'express'
import {
    getNotification,
    getUnreadCounter,
    markNotificationsAsRead,
    markAllAsRead
} from '../controllers/notificationController.js'
import authenticate from '../middleware/authenticate.js'

const router = express.Router()

router.get('/', authenticate, getNotification)
router.get('/unread-count', authenticate, getUnreadCounter)
router.patch('/read-all', authenticate, markAllAsRead)
router.patch('/:id/read', authenticate, markNotificationsAsRead)

export default router