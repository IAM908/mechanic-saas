
import pool from '../db/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (
            typeof email !== 'string' ||
            !email.trim() ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).json({
                message: 'El correo y la contraseña son obligatorios'
            })
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurado')

            return res.status(500).json({
                message: 'Error interno del servidor'
            })
        }

        const result = await pool.query(
            `SELECT
                id,
                business_id,
                name,
                email,
                password_hash,
                role,
                is_active
            FROM users
            WHERE email = $1`,
            [email.trim().toLowerCase()]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            })
        }

        const user = result.rows[0]

        if (!user.is_active) {
            return res.status(403).json({
                message: 'Esta cuenta está desactivada'
            })
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        )

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            })
        }

        const token = jwt.sign(
            {
                userId: user.id,
                business_id: user.business_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        )

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                business_id: user.business_id
            }
        })
    } catch (error) {
        console.error('Error al iniciar sesión:', error)

        return res.status(500).json({
            message: 'Error interno del servidor'
        })
    }
}
