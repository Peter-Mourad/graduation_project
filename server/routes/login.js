const express = require('express')
const router = express.Router()
const pool = require('../connection')
const jwt = require('../middlewares/JWT')

router.use(express.json())

router.get('/', (req, res) => {
    const username = req.body.username, password = req.body.password
    var field = "username"
    if (username.includes("@")) {
        field = "email"
    }
    
    pool.query(`SELECT u.id ,u.password FROM public.users u
	            WHERE u.${field} = '${username}'`, (err, result) => {
        if (err) {
            return res.status(404).send({error : err})
        }
        if (!result.rowCount) {
            if (field == "email") {
                return res.status(400).send({error: 'The email address you entered isn\'t connected to an account.'})
            } else {
                return res.status(400).send({ error: 'The username you entered isn\'t connected to an account.' })
            }
        }

        // now validate the password
        if (result.rows[0].password != password) {
            return res.status(400).send({error: 'The password that you\'ve entered is incorrect.'})
        }
        const { access_token, refresh_token} = jwt.GenerateToken(result.rows[0])
        return res.send({ access_token: access_token, refresh_token: refresh_token })
    })
})

module.exports = router