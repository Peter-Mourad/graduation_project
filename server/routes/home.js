const express = require('express');
const router = express.Router();
const pool = require('../connection');
const auth = require('../middlewares/auth')

router.use(express.json());

// load all chats
router.get('/:id', auth, (req, res) => {
    pool.query(`SELECT c.chat_name, c.chat_id , m.message 
				FROM public.chat c 
				INNER JOIN public.users u 
					ON u.id = c.user_id
				INNER JOIN (SELECT DISTINCT ON (m.chat_id) m.chat_id , m.message 
							FROM public.message m 
							ORDER BY m.chat_id ,m.delivered_time DESC) m 
					ON c.chat_id = m.chat_id 
				WHERE u.id = '${req.params.id}'
				ORDER BY c.chat_id DESC `,
		(err, result) => {
			if (err) return res.status(400).send({ error: err.message });
			return res.send(result.rows);
		}
	);
});

module.exports = router;