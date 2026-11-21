
import express from 'express'

import workSession from '../controllers/workSessionController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    workSession.getWorkSessions
)

router.get(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    workSession.getWorkSessionById
)

router.post(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    workSession.createWorkSession
)

router.patch(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    workSession.updateWorkSession
)

router.patch(
    '/:id/finish',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    workSession.finishWorkSession
)

export default router
