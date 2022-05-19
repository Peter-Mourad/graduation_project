const { json } = require('express');
const express = require('express');
const { parseTwoDigitYear } = require('moment');
const router = express.Router();
const pool = require('../connection');
const auth = require('../middlewares/auth')

router.use(express.json());

// load all chats
router.get('/', auth, (req, res) => {
	pool.query(`SELECT c.chat_name, c.chat_id , c.chat_type, m.message ,m.delivered_time, m.sender
				FROM public.chat c 
				INNER JOIN public.users u 
					ON u.id = c.user_id
				LEFT JOIN (SELECT DISTINCT ON (m.chat_id) m.chat_id , m.message, m.delivered_time, m.sender
							FROM public.message m 
							ORDER BY m.chat_id ,m.delivered_time DESC) m 
					ON c.chat_id = m.chat_id 
				WHERE u.id = '${req.user.id}'
				ORDER BY c.chat_id DESC `,
		(err, result) => {
			if (err) return res.status(400).send({ error: err.message });
			for (var i = 0; i < result.rowCount; i++){
				if (result.rows[i].message!=null) {
					result.rows[i].delivered_time = time_parse(result.rows[i].delivered_time);
				}
			}
			return res.send(result.rows);
		}
	);
});

const time_parse = (cur) => {
	const temp_date = new Date(cur),temp_cur_date = new Date(Date.now());
	let date = temp_date.toString(),cur_date = temp_cur_date.toString();
	const new_date = date.split(/[ :]+/), new_cur_date = cur_date.split(/[ :]+/);
	
	var hour = parseInt(new_date[4]);
	var time = "AM";
	if (hour >= 12) {
		if(hour> 12)
			hour -= 12;
		time = "PM";
	}
	var day = parseInt(new_date[2]), cur_day = parseInt(new_cur_date[2]);
	if (day == cur_day) {
		return `${hour}:${new_date[5]} ${time}`;
	}
	else if (day == cur_day - 1) {
		return `yesterday`;
	}
	else {
		return `${new_date[2]}/${new_date[1]}/${new_date[3]}`;
	}
}

module.exports = router;