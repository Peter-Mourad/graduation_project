const express = require('express')
const router = express.Router()
const pool = require('../connection')
const bodyParser = require('body-parser')
router.use(express.json())

router.get('/', (req, res) => {
    const username = req.body.username, password = req.body.password
    var field = "username"
    if (username.includes("@")) {
        field = "email"
    }
    console.log(`${field} :  ${username}`)
    pool.query(`SELECT u.id FROM public.users u
	            WHERE u.${field} = '${username}'`, (err, result) => {
        if (err) {
            return res.send(err)
        }
        return res.send(result.rows)
    })
})

module.exports = router