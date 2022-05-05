const express = require('express')
const router = express.Router()
const pool = require('../connection')
const bodyParser = require('body-parser')
const Joi = require('joi')

router.use(express.json())

router.post('/', async (req, res) => {
    var username = req.body.username, password = req.body.password, email = req.body.email,
        first_name = req.body.first_name, last_name = req.body.last_name, telephone_no = req.body.telephone_no
    
    // todo : validate registeration data
    var validation = await validateRegistraionData(req.body)
    
    if (validation.hasError) {
        return res.status(400).send({error : validation.error})
    }
    else {
        pool.query(`INSERT INTO public.users (username, "password", first_name, last_name, email, telephone_no)
	                VALUES ('${username}', '${password}', '${first_name}', '${last_name}', '${email}', '${telephone_no}')`,
            (err, result) => {
                if (err) {
                    return res.send({ error: err.message })
                }
                return res.send(result.rows)
            })
    }
})

async function validateRegistraionData(req) {
    var res = {
        hasError: false,
        error: ""
    }

    // data patterns validation 
    const schema = Joi.object({
        username: Joi.string().pattern(new RegExp('^[A-Za-z][A-Za-z0-9_]{7,29}$')).required(),
        email: Joi.string().pattern(new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z]+\\.[a-zA-Z]{3,20}$')).min(3).required(),
        first_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')).required(),
        last_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')).required(),
        telephone_no: Joi.string().pattern(new RegExp('^\\+(?:[0-9]●?){6,14}[0-9]$')).max(16).required(),
        password: Joi.string().pattern(new RegExp('^([A-Za-z\\d._]){8,30}$')).required()
    })
    const validateSchema = schema.validate({
        username: req.username,
        email: req.email,
        first_name: req.first_name,
        last_name: req.last_name,
        telephone_no: req.telephone_no,
        password: req.password
    })
    if (validateSchema.error) {
        res.hasError = true, res.error = validateSchema.error
        return res
    }

    // validate username uniqueness
    var results = await pool.query(`select * from public.users u
                                    where u.username = '${req.username}'
                                    limit 1`);
    if (results.rowCount) {
        res.hasError = true, res.error = 'This username arleady exists!'
        return res
    }

    // validate email uniqueness
    var results = await pool.query(`select * from public.users u
                                    where u.email = '${req.email}'
                                    limit 1`);
    if (results.rowCount) {
        res.hasError = true, res.error = 'This email arleady exists!'
        return res
    }

    return res
}

module.exports = router