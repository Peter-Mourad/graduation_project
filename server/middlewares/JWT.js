const jwt = require("jsonwebtoken")

function GenerateToken(req) {
    const access_token = jwt.sign(
        { id: req.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME }
    )
    const refresh_token = jwt.sign(
        {id: req.id}, 
        process.env.JWT_SECRET_KEY, 
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME }
    )
    return { access_token: access_token, refresh_token: refresh_token }
}

module.exports.GenerateToken = GenerateToken