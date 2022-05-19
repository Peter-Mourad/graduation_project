const express = require('express');
const router = express.Router();
const pool = require('../connection');
const auth = require('../middlewares/auth');
const Joi = require('joi');
const { json } = require('express');

router.use(express.json());

router.get('/', auth, (req, res) => {
    pool.query(`SELECT u.first_name ,u.last_name ,u.username ,u.email ,u.gender 
                FROM public.users u 
                WHERE u.id = '${req.user.id}'`,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.send(result.rows);
        }
    );
});

router.post('/edit', auth, (req, res) => {
    //validate new field
    const schema = Joi.object({
        username: Joi.string().pattern(new RegExp('^[A-Za-z][A-Za-z0-9_]{7,29}$')),
        email: Joi.string().pattern(new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z]+\\.[a-zA-Z]{3,20}$')).min(3),
        first_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')),
        last_name: Joi.string().pattern(new RegExp('^[A-Za-z]{3,30}$')),
    });
    const validateSchema = schema.validate(
        JSON.parse(`{"${req.body.field}": "${req.body.data}"}`)
    );
    if (validateSchema.error) {
        return res.status(400).send({ error: `${req.body.field} isn'\t valid` });
    }

    pool.query(`UPDATE public.users
                SET ${req.body.field} = '${req.body.data}'
                WHERE id = '${req.user.id}'`,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.sendStatus(200);
        }
    );
});

module.exports = router;