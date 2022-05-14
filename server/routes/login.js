const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pool = require('../connection')
const jwt = require('../middlewares/JWT')

router.use(express.json());

router.post('/', (req, res) => {
    const username = req.body.username, password = req.body.password;
    var field = "username";
    if (username.includes("@")) {
        field = "email";
    }
    
    pool.query(`SELECT u.id ,u.password FROM public.users u
	            WHERE u.${field} = '${username}'`, (err, result) => {
        if (err) {
            return res.
                status(404).
                send({ error: err });
        }

        if (!result.rowCount || !bcrypt.compareSync(password, result.rows[0].password)) {
            return res.
                status(401).
                send({ error: 'username or email doesn\'t match the password' });
        }

        const { access_token, refresh_token } = jwt.GenerateToken(result.rows[0]);
        return res.send({
            access_token: access_token,
            refresh_token: refresh_token
        });
    })
})

module.exports = router;
