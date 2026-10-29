import { Router } from 'express'
import { getWorkshops } from '../controllers/workshopController.js'

const router = Router()

router.get('/', getWorkshops)

export default router