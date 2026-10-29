
import pool from '../db/database.js'

const getVehicles = async (req, res) => {
    try {
        const businessId = req.user.business_id

        const result = await pool.query(
            `SELECT
                v.id,
                v.customer_id,
                v.plate,
                v.brand,
                v.model,
                v.year,
                v.created_at,
                c.name AS customer_name
            FROM vehicles v
            JOIN customers c ON c.id = v.customer_id
            WHERE c.business_id = $1
            ORDER BY v.id DESC`,
            [businessId]
        )

        return res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error('No se pudieron obtener los vehículos:', error)

        return res.status(500).json({
            success: false,
            message: 'Error al obtener los vehículos'
        })
    }
}

const getVehiclesId = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const { id } = req.params

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: 'El ID del vehículo no es válido'
            })
        }

        const result = await pool.query(
            `SELECT
                v.id,
                v.customer_id,
                v.plate,
                v.brand,
                v.model,
                v.year,
                v.created_at,
                c.name AS customer_name
            FROM vehicles v
            JOIN customers c ON c.id = v.customer_id
            WHERE v.id = $1 AND c.business_id = $2`,
            [id, businessId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        console.error('No se pudo obtener el vehículo:', error)

        return res.status(500).json({
            success: false,
            message: 'Error al obtener el vehículo'
        })
    }
}

const createVehicle = async (req, res) => {
    try {
        const businessId = req.user.business_id

        const {
            customer_id,
            plate,
            brand,
            model,
            year
        } = req.body

        const customerId = Number(customer_id)

        if (
            customer_id === undefined ||
            customer_id === null ||
            customer_id === '' ||
            !Number.isSafeInteger(customerId) ||
            customerId < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'El ID del cliente no es válido'
            })
        }

        if (typeof plate !== 'string' || !plate.trim()) {
            return res.status(400).json({
                success: false,
                message: 'La matrícula es obligatoria'
            })
        }

        if (
            brand != null && typeof brand !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'La marca no es válida'
            })
        }

        if (
            model != null && typeof model !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'El modelo no es válido'
            })
        }

        let vehicleYear = null

        if (year !== undefined && year !== null && year !== '') {
            vehicleYear = Number(year)

            if (
                !Number.isInteger(vehicleYear) ||
                vehicleYear < 1886 ||
                vehicleYear > new Date().getFullYear() + 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'El año del vehículo no es válido'
                })
            }
        }

        const customerResult = await pool.query(
            `SELECT id
            FROM customers
            WHERE id = $1 AND business_id = $2`,
            [customerId, businessId]
        )

        if (customerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado en este taller'
            })
        }

        const result = await pool.query(
            `INSERT INTO vehicles (
                customer_id,
                plate,
                brand,
                model,
                year
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, customer_id, plate, brand, model, year, created_at`,
            [
                customerId,
                plate.trim().toUpperCase(),
                brand?.trim() || null,
                model?.trim() || null,
                vehicleYear
            ]
        )

        return res.status(201).json({
            success: true,
            message: 'Vehículo registrado correctamente',
            data: result.rows[0]
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un vehículo con esa matrícula'
            })
        }

        console.error('No se pudo registrar el vehículo:', error)

        return res.status(500).json({
            success: false,
            message: 'Error al registrar el vehículo'
        })
    }
}

export { getVehicles, getVehiclesId, createVehicle }
