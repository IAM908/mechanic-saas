import express from 'express'

import  { getVehicles, getVehiclesId, createVehicle } from '../controllers/vehicleController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getVehicles
)

router.get(
    '/:id',
    authenticate, 
    requireRoles('owner', 'admin', 'mechanic'),
    getVehiclesId
)

router.post(
    '/',
    authenticate,
    requireRoles('owner', 'admin'),
    createVehicle
)

export default router