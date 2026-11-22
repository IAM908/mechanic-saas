import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pool from  '../backend/db/database.js'


import workOrderItemRoutes from './routes/workOrderItemRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import authRoutes from './routes/authRoutes.js'
import vehiclesRoutes from './routes/vehicleRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import memberRoutes from  './routes/memberRoutes.js'
import workOrderRoutes from './routes/workOrderRoutes.js'
import workSessionOrder from './routes/workSessionRoutes.js'
import workShopRouter from './routes/workshopRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

const app = express()

 
app.use(cors())
app.use(express.json())

app.use('/', authRoutes)
app.use('/vehicles', vehiclesRoutes)
app.use('/clients', clientRoutes)
app.use('/member', memberRoutes)
app.use('/workOrder', workOrderRoutes)
app.use('/workShop', workShopRouter)
app.use ('/workSessionOrder', workSessionOrder)
app.use('/notifications', notificationRoutes)
app.use('/budgets', budgetRoutes)
app.use('/workOrderItems', workOrderItemRoutes)
app.use('/dashboard', dashboardRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`)
})