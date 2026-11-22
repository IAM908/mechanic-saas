import express from 'express'
import { getDashboardSummary } from '../controllers/dashboardController.js'
import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
  '/',
  authenticate,
  requireRoles('owner', 'admin', 'mechanic'),
  getDashboardSummary
)

export default router