const express = require('express')
const moment = require('moment')
const nodemailer = require('nodemailer')
const pool = require('../connection')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const router = express.Router()

require('dotenv').config()

router.use(express.json());

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
        return res.status(400).send({ error: err.message });
    }

    var creation_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var expiration_time = moment(Date.now() + 3600000).format('YYYY-MM-DD HH:mm:ss');
    try {
        var result = await pool.query(`SELECT o.id FROM public.otp o 
	                                    WHERE o.id = '${user_id}'`)
        if(!result.rowCount){
            pool.query(`INSERT INTO public.otp (id, code, created_at, expired_at) 
                VALUES ('${user_id}', '${code}', '${creation_time}', '${expiration_time}')`);
        }
        else {
            pool.query(`UPDATE public.otp 
                        SET code = '${code}',
                            created_at = '${creation_time}',
                            expired_at = '${expiration_time}'
                        WHERE otp.id = '${user_id}'`);
        }
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }

    // mail html
    const mail = `
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                      <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                      <h2 style="color:#1e1e2d; font-weight:500; margin:0;font-family:'Rubik',sans-serif;">Your Code is ${code}</h2>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique code to reset your
                                            password has been generated for you.
                                        </p>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>`;
    
    const info = {
        from: process.env.GMAIL_ACCOUNT,
        to: req.body.email,
        subject: "reset password code",
        text: `hi ${name} this is your recovery password code : ${code}`,
        html: mail
    };

    transporter.sendMail(info, (err, result) => {
        if (err) return res.status(400).send({ error: err.message });
        return res.send({ code: code });
    });
});

router.post('/verify-code', async (req, res) => {
    var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    
    pool.query(`SELECT o.code FROM public.otp o
                WHERE 	o.code = '${req.body.code}'
                    AND o.expired_at > timestamp '${time}'`,
    (err, result) => {
        if (err) return res.status(400).send({ error: err.message });
        if (!result.rowCount) {
            return res.status(401).send({ error: 'This code has expired' });
        }
        return res.sendStatus(200);
    });  
});

router.post('/update-password', async (req, res) => {
    var result = await pool.query(`SELECT o.id FROM public.otp o 
	        WHERE o.code = '${req.body.code}'`);
    if (result.rowCount) {
        const user_id = result.rows[0].id;
        const schema = Joi.object({
            password: Joi.string().pattern(new RegExp('^([A-Za-z\\d._]){8,30}$')).required()
        });
        const validateSchema = schema.validate({
            password: req.body.password
        });
        if (validateSchema.error) {
            return res.status(400).send({ error: 'The password isn\'t valid' });
        }

        const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        pool.query(`UPDATE public.users 
                    SET "password" = '${password}'
                    WHERE users.id = '${user_id}'`);
        return res.sendStatus(200);
    }
    else return res.status(400).send({ error: 'user not found' });
});

module.exports = router;