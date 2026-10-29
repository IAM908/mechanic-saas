import pool from '../db/database.js'

export const getOrder = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const result = await pool.query(
            `SELECT wo.id, wo.description, wo.status, wo.created_at,
                    c.name AS customer_name, v.plate, v.brand, v.model,
                    u.name AS mechanic_name
             FROM work_orders wo
             JOIN customers c ON c.id = wo.customer_id
             JOIN vehicles v ON v.id = wo.vehicle_id
             LEFT JOIN users u ON u.id = wo.mechanic_id
             WHERE wo.business_id = $1
             ORDER BY wo.created_at DESC`,
            [businessId]
        )

        return res.status(200).json({ success: true, data: result.rows })
    } catch (error) {
        console.error('Error al conseguir las ordenes:', error)
        return res.status(500).json({
            success: false,
            message: 'Error al conseguir el pedido.'
        })
    }
}

export const createOrder = async (req, res) => {
    const businessId = req.user.business_id
    const { customer_id, vehicle_id, mechanic_id, description } = req.body

    if (
        !Number.isSafeInteger(customer_id) || customer_id < 1 ||
        !Number.isSafeInteger(vehicle_id) || vehicle_id < 1
    ) {
        return res.status(400).json({
            success: false,
            message: 'El cliente y el vehiculo son obligatorios'
        })
    }

    if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
            success: false,
            message: 'La descripcion de la reparacion es obligatoria'
        })
    }

    if (mechanic_id != null && (!Number.isSafeInteger(mechanic_id) || mechanic_id < 1)) {
        return res.status(400).json({
            success: false,
            message: 'El ID del mecanico no es valido'
        })
    }

    const client = await pool.connect()
    let transactionStarted = false

    try {
        await client.query('BEGIN')
        transactionStarted = true

        const customer = await client.query(
            'SELECT id FROM customers WHERE id = $1 AND business_id = $2',
            [customer_id, businessId]
        )
        if (customer.rows.length === 0) {
            await client.query('ROLLBACK')
            transactionStarted = false
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado en este taller'
            })
        }

        const vehicle = await client.query(
            'SELECT id FROM vehicles WHERE id = $1 AND business_id = $2',
            [vehicle_id, businessId]
        )
        if (vehicle.rows.length === 0) {
            await client.query('ROLLBACK')
            transactionStarted = false
            return res.status(404).json({
                success: false,
                message: 'Vehiculo no encontrado en este taller'
            })
        }

        if (mechanic_id != null) {
            const mechanic = await client.query(
                "SELECT id FROM users WHERE id = $1 AND business_id = $2 AND role = 'mechanic'",
                [mechanic_id, businessId]
            )
            if (mechanic.rows.length === 0) {
                await client.query('ROLLBACK')
                transactionStarted = false
                return res.status(400).json({
                    success: false,
                    message: 'El mecanico no pertenece a este taller'
                })
            }
        }

        const result = await client.query(
            `INSERT INTO work_orders (
                business_id, customer_id, vehicle_id, mechanic_id, description
             ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [businessId, customer_id, vehicle_id, mechanic_id ?? null, description.trim()]
        )

        await client.query('COMMIT')
        transactionStarted = false
        return res.status(201).json({
            success: true,
            message: 'Orden de reparacion creada correctamente',
            data: result.rows[0]
        })
    } catch (error) {
        if (transactionStarted) {
            await client.query('ROLLBACK')
        }
        console.error('Error al crear la orden:', error)
        return res.status(500).json({
            success: false,
            message: 'Error al crear la orden de reparacion.'
        })
    } finally {
        client.release()
    }
}



const getOrderById = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const { id } = req.params

        if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID de orden inválido'
            })
        }

        const result = await pool.query(
            `SELECT wo.id, wo.description, wo.status, wo.created_at,
                    c.name AS customer_name, v.plate, v.brand, v.model,
                    u.name AS mechanic_name
             FROM work_orders wo
             JOIN customers c ON c.id = wo.customer_id
             JOIN vehicles v ON v.id = wo.vehicle_id
             LEFT JOIN users u ON u.id = wo.mechanic_id
             WHERE wo.business_id = $1 AND wo.id = $2`,
            [businessId, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada en este taller'
            })
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        console.error('Error al conseguir la orden:', error)
        return res.status(500).json({
            success: false,
            message: 'Error al conseguir la orden.'
        })
    }
}

export {getOrder, createOrder, getOrderById}