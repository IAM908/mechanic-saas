import pool from '../db/database.js'

const getClients = async (req, res) => {
    try {
        const businessId = req.user.business_id

        const result = await pool.query(
            `SELECT id, name, plate, phone, created_at FROM customers WHERE business_id = $1 ORDER BY id DESC`,
            [businessId]
        )

        return res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error('Error al obtener los clientes del negocio', error)

        return res.status(500).json({
            success: false,
            message: 'Error al obtener los clientes'
        })
    }
}

const getClientsId = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const { id } = req.params

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: 'El ID es invalido'
            })
        }


        const result = await pool.query(
            `SELECT id, name, plate, phone, created_at FROM customers WHERE id = $1 AND business_id = $2`,
            [id, businessId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        console.error('Error al conseguir cliente', error)

        return res.status(500).json({
            success: false,
            message: 'Error al obtener cliente'
        })
    }
}

const createClient = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const { name, plate, phone } = req.body

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del cliente es obligatorio'
            })
        }

        if (phone !== undefined && phone !== null && typeof phone !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'El telefono es invalido'
            })
        }

        if (typeof plate !== 'string' || !plate.trim()) {
            return res.status(400).json({
                success: false,
                message: 'La matricula del vehiculo es obligatoria'
            })
        }

        const result = await pool.query(
            `INSERT INTO customers (business_id, name, plate, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, plate, phone, created_at`,
            [businessId, name.trim(), plate.trim(), phone ? phone.trim() : null]
        )

        return res.status(201).json({
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        console.error('Error al crear cliente', error)

        return res.status(500).json({
            success: false,
            message: 'Error al crear cliente'
        })
    }
}