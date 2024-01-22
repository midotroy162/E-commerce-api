const { validationResult } = require("express-validator");
// @desc finds the validation errors in this request and warps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
    next();
        
}
module.exports = validatorMiddleware;