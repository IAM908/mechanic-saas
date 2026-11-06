const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user){
            return res.status(401).json({
                message: 'No estas autenticado con algun role'
            })
        }

        if(!allowedRoles(req.user.role)){
            return res.status(403).json({
                message: 'No tienes permisos para realizar esta acción'
            })
        }
        next()
    }
}

export default requireRoles