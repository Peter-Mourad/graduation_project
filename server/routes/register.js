const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pool = require('../connection')
const Joi = require('joi')

router.use(express.json())

router.post('/', async (req, res) => {
    var username = req.body.username, password = req.body.password, email = req.body.email,
        first_name = req.body.first_name, last_name = req.body.last_name, gender = req.body.gender;
    
    // validate registeration data
    var validation = await validateRegistraionData(req.body);
    
    if (validation.hasError) {
        return res.
            status(400).
            send({ error: validation.error });
    }
    else {
        password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        pool.query(`INSERT INTO public.users (username, "password", first_name, last_name, email, gender)
	                VALUES ('${username}', '${password}', '${first_name}', '${last_name}', '${email}', '${gender}')`,
            (err, result) => {
                if (err) {
                    return res.send({ error: err.message });
                }
                return res.send(result.rows);
            })
    }
})

async function validateRegistraionData(req) {
    var res = {
        hasError: false,
        error: ""
    };

    // data patterns validation 
    const schema = Joi.object({
        username: Joi.string().pattern(new RegExp('^[A-Za-z][A-Za-z0-9_]{7,29}$')).required(),
        email: Joi.string().pattern(new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z]+\\.[a-zA-Z]{3,20}$')).min(3).required(),
        first_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')).required(),
        last_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')).required(),
        password: Joi.string().pattern(new RegExp('^([A-Za-z\\d._]){8,30}$')).required(),
        gender: Joi.string().pattern(new RegExp('^(female|male)$')).min(4).max(6).required()
    });
    const validateSchema = schema.validate({
        username: req.username,
        email: req.email,
        first_name: req.first_name,
        last_name: req.last_name,
        password: req.password,
        gender: req.gender
    });

    if (validateSchema.error) {
        const err = validateSchema.error.message;
        res.hasError = true;
        if (err.includes('username')) {
            res.error = 'The username isn\'t valid';
        }
        else if (err.includes('email')) {
            res.error = 'The email isn\'t valid';
        }
        else if (err.includes('first_name')) {
            res.error = 'The first name isn\'t valid';
        }
        else if (err.includes('last_name')) {
            res.error = 'The last name isn\'t valid';
        }
        else if(err.includes('gender')){
            res.error = 'The gender isn\'t valid';
        }
        else {
            res.error = 'The password isn\'t valid';
        }
        return res;
    }

    // validate username uniqueness
    var results = await pool.query(`select * from public.users u
                                    where u.username = '${req.username}'
                                    limit 1`);
    if (results.rowCount) {
        res.hasError = true, res.error = 'This username arleady exists!';
        return res;
    }

    // validate email uniqueness
    var results = await pool.query(`select * from public.users u
                                    where u.email = '${req.email}'
                                    limit 1`);
    if (results.rowCount) {
        res.hasError = true, res.error = 'This email arleady exists!';
        return res;
    }

    return res;
}

module.exports = router;