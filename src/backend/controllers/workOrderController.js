import pool from '../db/database.js'

const getOrder = async (req, res) => {
    try {
        const businessId = req.user.business_id
        const result = await pool.query(
            `SELECT wo.id, wo.customer_id, wo.vehicle_id, wo.mechanic_id,
                    wo.description, wo.status, wo.created_at, wo.updated_at,
                    c.name AS customer_name, c.phone AS customer_phone,
                    v.plate, v.brand, v.model, v.year,
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
            message: 'Error al conseguir las ordenes.'
        })
    }
}

const createOrder = async (req, res) => {
    const businessId = req.user.business_id
    const { customer_id, vehicle_id, mechanic_id, description } = req.body

    const customerId = Number(customer_id)
    const vehicleId = Number(vehicle_id)
    const mechanicId = mechanic_id != null && mechanic_id !== '' ? Number(mechanic_id) : null

    if (
        !Number.isSafeInteger(customerId) || customerId < 1 ||
        !Number.isSafeInteger(vehicleId) || vehicleId < 1
    ) {
        return res.status(400).json({
            success: false,
            message: 'El cliente y el vehiculo son obligatorios y deben ser IDs validos'
        })
    }

    if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
            success: false,
            message: 'La descripcion de la reparacion es obligatoria'
        })
    }

    if (mechanicId !== null && (!Number.isSafeInteger(mechanicId) || mechanicId < 1)) {
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
            [customerId, businessId]
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
            `SELECT v.id
             FROM vehicles v
             JOIN customers c ON c.id = v.customer_id
             WHERE v.id = $1 AND v.customer_id = $2 AND c.business_id = $3`,
            [vehicleId, customerId, businessId]
        )
        if (vehicle.rows.length === 0) {
            await client.query('ROLLBACK')
            transactionStarted = false
            return res.status(404).json({
                success: false,
                message: 'El vehiculo no existe o no pertenece a este cliente en tu taller'
            })
        }

        if (mechanicId !== null) {
            const mechanic = await client.query(
                `SELECT id
                 FROM users
                 WHERE id = $1 AND business_id = $2 AND role = 'mechanic' AND is_active = TRUE`,
                [mechanicId, businessId]
            )
            if (mechanic.rows.length === 0) {
                await client.query('ROLLBACK')
                transactionStarted = false
                return res.status(400).json({
                    success: false,
                    message: 'El mecanico no pertenece a este taller o esta inactivo'
                })
            }
        }

        const initialStatus = mechanicId !== null ? 'assigned' : 'pending'

        const result = await client.query(
            `INSERT INTO work_orders (
                business_id, customer_id, vehicle_id, mechanic_id, description, status
             ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [businessId, customerId, vehicleId, mechanicId, description.trim(), initialStatus]
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

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID de orden invalido'
            })
        }

        const result = await pool.query(
            `SELECT wo.id, wo.customer_id, wo.vehicle_id, wo.mechanic_id,
                    wo.description, wo.status, wo.created_at, wo.updated_at,
                    c.name AS customer_name, c.phone AS customer_phone,
                    v.plate, v.brand, v.model, v.year,
                    u.name AS mechanic_name
             FROM work_orders wo
             JOIN customers c ON c.id = wo.customer_id
             JOIN vehicles v ON v.id = wo.vehicle_id
             LEFT JOIN users u ON u.id = wo.mechanic_id
             WHERE wo.business_id = $1 AND wo.id = $2`,
            [businessId, Number(id)]
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

export { getOrder, createOrder, getOrderById }