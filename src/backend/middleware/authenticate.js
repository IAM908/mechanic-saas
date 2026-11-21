
import jwt from 'jsonwebtoken'

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization

    console.log('Authorization recibido:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Token no proporcionado'
        })
    }

    const token = authHeader.split(' ')[1]

    console.log('Token extraído:', token ? 'Existe' : 'Vacío')

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Token inválido o expirado'
        })
    }
}

export default authenticate
