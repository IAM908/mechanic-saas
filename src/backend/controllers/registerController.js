import pool from '../db/database.js'
import bcrypt from 'bcrypt'

export const register = async(req, res) => {
    const {business_name, name, email, password} = req.body

    if(
        typeof business_name !== 'string' ||
        !business_name.trim() ||
        typeof name !== 'string' ||
        !name.trim() ||
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        password.length < 8
    ){
        return res.status(400).json({
            message: 'Completa los campos y usa una contraseña de al menos 8 caracteres'
        })
    }
    
    if (password.length > 72){
        return res.status(400).json({
            message: 'La contraseña supera el limite permitido'
        })
    }

    const client = await pool.connect() 

    try {
        await client.query('BEGIN')

        const normalizedEmail = email.trim().toLowerCase()

        const existingUser = await client.query(
            `SELECT id FROM users WHERE email = $1`,
            [normalizedEmail]
        )

        if (existingUser.rows.length > 0){
            await client.query('ROLLBACK')

            return res.status(409).json({
                message: 'Este correo ya esta registrado'
            })
        }

        const businessResult = await client.query(
            `INSERT INTO businesses (name)
            VALUES ($1)
            RETURNING id`, [
                business_name.trim()
            ]
            
        )

        const businessId = businessResult.rows[0].businessId
        const passwordHash = await bcrypt.hash(password, 10)

        const userResult = await client.query(
            `INSERT INTO users 
            (business_id, name, email, password_hash, role)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *`, [
                businessId, name.trim(), email, passwordHash, 'owner'
            ]
        )
        await client.query('COMMIT')

        return res.status(201).json({
            message: 'Taller registrado correctamente',
            user: userResult.rows[0]
        })

    }catch(error){
        z
    }
}