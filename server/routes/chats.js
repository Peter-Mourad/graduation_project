const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const pool = require('../connection');
const jwt = require("jsonwebtoken");
const moment = require('moment');

router.use(express.json());

router.post('/add', auth, (req, res) => {
    const user_id = req.user.id, chat_name = req.body.chat_name, chat_type = req.body.chat_type;  
    pool.query(`INSERT INTO public.chat(user_id, chat_name, chat_type) 
	            VALUES ('${user_id}', '${chat_name}', '${chat_type}')`,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.sendStatus(200);
        }
    );
});

// load chat messages of a specific chat when opened
router.post('/load', auth, (req, res) => {
    pool.query(`SELECT m.message, m.delivered_time, m.id, m.sender  FROM public.message m 
                WHERE m.chat_id = '${req.body.chat_id}'
                ORDER BY m.delivered_time DESC `,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.send(result.rows);
        }
    );
});

// add message to a specific chat
router.post('/add-message', auth, (req, res) => {
    var delivered_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    pool.query(`INSERT INTO  public.message (message, delivered_time, chat_id, sender) 
	            VALUES ('${req.body.message}', '${delivered_time}', '${req.body.chat_id}', 'true') `,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.sendStatus(200);
        }
    );
});

module.exports = router