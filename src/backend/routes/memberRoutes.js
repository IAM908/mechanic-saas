import express from 'express'

import memberController, {
    getMembers,
  getMemberById,
  createMember,
  updateMember,
  deactivateMember
} from '../controllers/memberController.js'

import authenticate from '../middleware/authenticate.js'
import requireRoles from '../middleware/requireRoles.js'

const router = express.Router()

router.get(
    '/',
    authenticate,
    requireRoles('owner', 'admin'),
    memberController.getMembers
)

router.get(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin'),
    memberController.createMember
)

router.patch(
    '/:id',
    authenticate,
    requireRoles('owner', 'admin'),
    memberController.updateMember
)


router.patch(
    '/:id/deactivate',
    authenticate,
    requireRoles('owner', 'admin'),
    memberController.deactivateMember
)

export default router