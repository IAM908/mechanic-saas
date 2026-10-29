
import pool from ('../db/database.js')
import bcrypt from 'bcrypt'

const validRoles = ['admin', 'mechanic']

const getMembers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE business_id = $1
       ORDER BY created_at DESC`,
      [req.user.business_id]
    )

    return res.status(200).json({
      message: 'Miembros obtenidos correctamente.',
      members: result.rows
    })
  } catch (error) {
    console.error('Error al obtener miembros:', error)

    return res.status(500).json({
      message: 'Error interno al obtener los miembros.'
    })
  }
}

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = $1 AND business_id = $2`,
      [id, req.user.business_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Miembro no encontrado.'
      })
    }

    return res.status(200).json({
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Error al consultar miembro:', error)

    return res.status(500).json({
      message: 'Error interno al consultar el miembro.'
    })
  }
}

const createMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 8 ||
      !validRoles.includes(role)
    ) {
      return res.status(400).json({
        message: 'Nombre, correo válido, contraseña de al menos 8 caracteres y rol válido son obligatorios.',
        validRoles
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingMember = await pool.query(
      `SELECT id
       FROM users
       WHERE email = $1 AND business_id = $2`,
      [normalizedEmail, req.user.business_id]
    )

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo en este taller.'
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (
        business_id,
        name,
        email,
        password_hash,
        role,
        is_active,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
      RETURNING id, name, email, role, is_active, created_at`,
      [
        req.user.business_id,
        name.trim(),
        normalizedEmail,
        passwordHash,
        role
      ]
    )

    return res.status(201).json({
      message: 'Miembro creado correctamente.',
      member: result.rows[0]
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Ya existe un usuario con ese correo.'
      })
    }

    console.error('Error al crear miembro:', error)

    return res.status(500).json({
      message: 'Error interno al crear el miembro.'
    })
  }
}

const updateMember = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    if (
      name === undefined &&
      email === undefined &&
      role === undefined
    ) {
      return res.status(400).json({
        message: 'Debes proporcionar al menos un campo para actualizar.'
      })
    }

    if (
      name !== undefined &&
      (typeof name !== 'string' || !name.trim())
    ) {
      return res.status(400).json({
        message: 'El nombre no puede estar vacío.'
      })
    }

    if (
      email !== undefined &&
      (typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    ) {
      return res.status(400).json({
        message: 'El correo electrónico no es válido.'
      })
    }

    if (role !== undefined && !validRoles.includes(role)) {
      return res.status(400).json({
        message: 'El rol indicado no es válido.',
        validRoles
      })
    }

    const fields = []
    const values = []

    const addField = (column, value) => {
      values.push(value)
      fields.push(`${column} = $${values.length}`)
    }

    if (name !== undefined) {
      addField('name', name.trim())
    }

    if (email !== undefined) {
      addField('email', email.trim().toLowerCase())
    }

    if (role !== undefined) {
      addField('role', role)
    }

    values.push(id)
    const idPosition = values.length

    values.push(req.user.business_id)
    const businessPosition = values.length

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${idPosition}
         AND business_id = $${businessPosition}
       RETURNING id, name, email, role, is_active, created_at`,
      values
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Miembro no encontrado.'
      })
    }

    return res.status(200).json({
      message: 'Miembro actualizado correctamente.',
      member: result.rows[0]
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Ese correo ya está registrado.'
      })
    }

    console.error('Error al actualizar miembro:', error)

    return res.status(500).json({
      message: 'Error interno al actualizar el miembro.'
    })
  }
}

const deactivateMember = async (req, res) => {
  try {
    const { id } = req.params

    if (String(id) === String(req.user.id)) {
      return res.status(400).json({
        message: 'No puedes desactivar tu propia cuenta desde este endpoint.'
      })
    }

    const result = await pool.query(
      `UPDATE users
       SET is_active = FALSE
       WHERE id = $1
         AND business_id = $2
         AND is_active = TRUE
       RETURNING id, name, email, role, is_active`,
      [id, req.user.business_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Miembro no encontrado o ya desactivado.'
      })
    }

    return res.status(200).json({
      message: 'Miembro desactivado correctamente.',
      member: result.rows[0]
    })
  } catch (error) {
    console.error('Error al desactivar miembro:', error)

    return res.status(500).json({
      message: 'Error interno al desactivar el miembro.'
    })
  }
}

export default {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deactivateMember
}
