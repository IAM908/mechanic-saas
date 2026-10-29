
import express from 'express'
import cors from 'cors'
import workshopRoutes from './routes/workshopRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/workshops', workshopRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`)
})
