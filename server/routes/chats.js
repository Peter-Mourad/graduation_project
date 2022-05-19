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
            for (var i = 0; i < result.rowCount; i++) {
                if (result.rows[i].message != null) {
                    result.rows[i].delivered_time = time_parse(result.rows[i].delivered_time);
                }
            }
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

const time_parse = (cur) => {
    const temp_date = new Date(cur);
    let date = temp_date.toString();
    const new_date = date.split(/[ :]+/);
    var hour = parseInt(new_date[4]);
    var time = "AM";
    if (hour >= 12) {
        if (hour > 12)
            hour -= 12;
        time = "PM";
    }
    return `${hour}:${new_date[5]} ${time}`;
}

module.exports = router