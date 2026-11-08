import express from 'express'

import {
    getOrder, createOrder, getOrderById
} from '../controllers/workOrderController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner','admin', 'mechanic'),
    getOrder
)

router.get(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin', 'mechanic'),
    getOrderById
)

router.post(
    '/',
    authenticate,
    requireRoles('owner', 'admin'),
    createOrder
)


export default router
