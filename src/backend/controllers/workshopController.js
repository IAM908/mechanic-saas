
import pool from '../db/database.js'


const getWorkshops = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workshops ORDER BY id DESC'
    )

    return res.status(200).json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error al obtener talleres:', error)

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los talleres'
    })
  }
}

const createWorkshop = async (req, res) => {
  try {
    const { name, phone, address } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del taller es obligatorio'
      })
    }

    const result = await pool.query(
      `INSERT INTO workshops (name, phone, address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), phone || null, address || null]
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
