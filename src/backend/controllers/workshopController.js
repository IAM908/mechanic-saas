import pool from '../db/database.js'

const getWorkshops = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, address, created_at
       FROM businesses
       WHERE id = $1`,
      [req.user.business_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Taller no encontrado'
      })
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error al obtener el taller:', error)

    return res.status(500).json({
      success: false,
      message: 'Error al obtener la informacion del taller'
    })
  }
}

const createWorkshop = async (req, res) => {
  try {
    const { name, phone, address } = req.body

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del taller es obligatorio'
      })
    }

    const result = await pool.query(
      `INSERT INTO businesses (name, phone, address)
       VALUES ($1, $2, $3)
       RETURNING id, name, phone, address, created_at`,
      [
        name.trim(),
        typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        typeof address === 'string' && address.trim() ? address.trim() : null
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Taller creado correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error al crear taller:', error)

    return res.status(500).json({
      success: false,
      message: 'Error al crear el taller'
    })
  }
}

export { getWorkshops, createWorkshop }