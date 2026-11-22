import express from 'express'
import {
  getItemsByOrder,
  addItemToRevision,
  updateWorkOrderItem,
  deleteWorkOrderItem
} from '../controllers/workOrderItemController.js'
import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
  '/order/:workOrderId',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic', 'customer'),
  getItemsByOrder
)

router.post(
  '/',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic'),
  addItemToRevision
)

router.patch(
  '/:id',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic'),
  updateWorkOrderItem
)

router.delete(
  '/:id',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic'),
  deleteWorkOrderItem
)

export default router