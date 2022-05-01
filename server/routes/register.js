const express = require('express')
const router = express.Router()
const pool = require('../connection')
const bodyParser = require('body-parser')
router.use(express.json())

router.post('/', (req, res) => {
    var username = req.body.username, password = req.body.password
    
    // todo : validate registeration data

    pool.query(`INSERT INTO public.users (username, "password") 
                VALUES ('${req.body.username}','${req.body.password}')`, (err, result) => {
        if (err) {
            return res.send({ error: err.message })
        }
        return res.send(result.rows)
    })

})

function validateRegistraionData() {
    return ({
        hasError: false,
        error:  ""
    })
}

module.exports = router