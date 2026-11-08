
import express from 'express'

import {
    getWorkshops,
    createWorkshop
} from '../controllers/workshopController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin'),
    getWorkshops
)

router.post(
    '/',
    authenticate,
    requireRoles('owner'),
    createWorkshop
)

export default router
