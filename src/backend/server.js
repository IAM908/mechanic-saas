import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pool from  '../backend/db/database.js'


import budgetRoutes from './routes/budgetRoutes.js'
import authRoutes from './routes/authRoutes.js'
import vehiclesRoutes from './routes/vehicleRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import memberRoutes from  './routes/memberRoutes.js'
import workOrderRoutes from './routes/workOrderRoutes.js'
import workSessionOrder from './routes/workSessionRoutes.js'
import workShopRouter from './routes/workshopRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

const app = express()

pool.query(`
    SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS schema_name,
        to_regclass('public.users') AS users_table,
        to_regclass('users') AS unqualified_users,
        has_schema_privilege(current_user, 'public', 'USAGE') AS can_use_public
`)
.then(result => {
    console.log('Diagnóstico:', result.rows[0])
})
.catch(error => {
    console.error('Error:', error)
})
 
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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`)
})