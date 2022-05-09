const jwt = require("jsonwebtoken");

function GenerateToken(req) {
    const token = jwt.sign({ id: req.id, password: req.password },
        process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN })
    return token
}

function VerifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        if (err) return err.message
        if ((decoded.exp * 1000 - Date.now()) / 1000 < 0) return false
        return true
    })
}

module.exports.GenerateToken = GenerateToken
module.exports.VerifyToken = VerifyToken