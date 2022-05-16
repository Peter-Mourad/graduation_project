const nodemailer = require('nodemailer')
const express = require('express')
const pool = require('../connection')
const moment = require('moment')
const { string } = require('joi')
const router = express.Router()
require('dotenv').config()

router.use(express.json())

router.post('/', async (req, res) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // create code and store in dp
    const code = Math.floor(100000 + Math.random() * 900000)
    
    var user_id = BigInt(0), name = "";
    try {
        var result = await pool.query(`SELECT u.id, u.first_name FROM public.users u 
	                WHERE u.email = '${req.body.email}'`);
        if (!result.rowCount) {
            return res.status(401).send({ error: 'This email doesn\'t exist' });
        }
        user_id = result.rows[0].id, name = result.rows[0].first_name;
    } catch (err) {
        return res.status(401).send({ error: err.message });
    }

    var creation_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var expiration_time = moment(Date.now() + 60000).format('YYYY-MM-DD HH:mm:ss');
    try {
        pool.query(`INSERT INTO public.otp (id, code, created_at, expired_at) 
            VALUES ('${user_id}', '${code}', '${creation_time}', '${expiration_time}')`);
    } catch (err) {
        return res.status(401).send({ error: err.message });
    }

    // mail html
    const mail = ``;
    
    const info = {
        from: process.env.GMAIL_ACCOUNT,
        to: req.body.email,
        subject: "reset password code",
        text: `hi ${name} this is your recovery password code : ${code}`,
        html: mail
    };

    transporter.sendMail(info, (err, result) => {
        if (err) return res.status(401).send({ error: err.message });
        return res.send({ code: code });
    });
});



router.post('/verify-code', async (req, res) => {
    var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    
    pool.query(`SELECT o.code FROM public.otp o
                WHERE 	o.code = '${req.body.code}'
                    AND o.expired_at > timestamp '${time}'`,
    (err, result) => {
        if (err) return res.status(401).send({ error: err.message });
        if (!result.rowCount) {
            return res.status(401).send({ error: 'This code has expired' });
        }
        return res.send({ code: result.rows[0].code });
    });  
});

module.exports = router