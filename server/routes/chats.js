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
    pool.query(`SELECT m.message, m.delivered_time, m.id  FROM public.message m 
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
	            VALUES ('${req.body.message}', '${delivered_time}', '${req.body.chat_id}', '${req.body.sender}') `,
        (err, result) => {
            if (err) return res.status(400).send({ error: err.message });
            return res.sendStatus(200);
        }
    );
});

const time_parse = (cur) => {
    var year = parseInt(cur.substring(0, 4));
    var month = parseInt(cur.substring(5, 7));
    var day = parseInt(cur.substring(8, 10));
    var hour = parseInt(cur.substring(11, 13));
    var min = parseInt(cur.substring(14, 16));
    var sec = parseInt(cur.substring(17, cur.length - 1));
}

module.exports = router