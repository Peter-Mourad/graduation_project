const { json } = require('express');
const express = require('express');
const { parseTwoDigitYear } = require('moment');
const router = express.Router();
const pool = require('../connection');
const auth = require('../middlewares/auth')

router.use(express.json());

// load all chats
router.get('/', auth, (req, res) => {
	pool.query(`SELECT c.chat_name, c.chat_id , m.message ,m.delivered_time, m.sender
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
			return res.send(result.rows);
		}
	);
});

const time_parse = (cur) => {
	const date = new Date(cur);
	console.log(date, date.getDate(), date.getMonth(), date.getFullYear());
	// var year = parseInt(cur.substring(0, 4));
	// var month = parseInt(cur.substring(5, 7));
	// var day = parseInt(cur.substring(8, 10));
	// var hour = parseInt(cur.substring(11, 13));
	// var min = parseInt(cur.substring(14, 16));
	// var sec = parseInt(cur.substring(17, cur.length - 1));
	const today = new Date();
	// console.log(today.getDate(),day);
	// if (today.getDate() == day) {
	// 	return day;
	// }
	return today;
}

module.exports = router;