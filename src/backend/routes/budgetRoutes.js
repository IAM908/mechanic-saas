import express from 'express'
import {
  getBudgetsByOrder,
  createBudgetRevision,
  reviewBudgetByAdmin,
  respondBudgetByCustomer
} from '../controllers/budgetController.js'
import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
  '/order/:workOrderId',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic', 'customer'),
  getBudgetsByOrder
)

router.post(
  '/',
  authenticate,
  requireRoles('mechanic', 'owner'),
  createBudgetRevision
)

router.patch(
  '/:id/admin-review',
  authenticate,
  requireRoles('owner', 'admin'),
  reviewBudgetByAdmin
)

router.patch(
  '/:id/customer-response',
  authenticate,
  requireRoles('customer'),
  respondBudgetByCustomer
)

export default router