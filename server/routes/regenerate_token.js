const jwt = require("jsonwebtoken")
const express = require('express')
const router = express.Router()

router.use(express.json())

router.get('/', (req, res) => {
    const refresh_token = req.body.refresh_token
    jwt.verify(refresh_token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err)
            return res.send({ error: 'refresh token isn\'t valid' })
                
        if ((decoded.exp * 1000 - Date.now()) / 1000 < 0)
            return res.send({ error: 'Expired token' })
        
        const access_token = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME }
        )
        return res.send({ access_token: access_token })
    })
})

module.exports = router