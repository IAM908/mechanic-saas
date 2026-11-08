import express from 'express'

import {
    getClients,
    getClientsId,
    createClient
} from '../controllers/clientController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getClients
)

router.get(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getClientsId
)

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin'),
    createClient
)