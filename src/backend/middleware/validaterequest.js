const validateRequest = (validations) => {
    return (req, res, next) => {
        const errors = validations
            .map(validation => validation(req))
            .filter(error => error !== null);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Error de validacion',
                errors
            });
        }

        next();
    };
};