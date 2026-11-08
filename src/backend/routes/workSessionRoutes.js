
import express from 'express'

import {
    createWorkSession,
    getWorkSessions,
    getWorkSessionById,
    updateWorkSession,
    finishWorkSession
} from '../controllers/workSessionController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getWorkSessions
)

router.get(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getWorkSessionById
)

router.post(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    createWorkSession
)

router.patch(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    updateWorkSession
)

router.patch(
    '/:id/finish',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    finishWorkSession
)

export default router
