const express = require('express');
const router = express.Router();
const pool = require('../connection');

router.use(express.json());

// create chat
router.get('/:id', async (req, res) => {
    const result = await pool.query(`SELECT c.chat_name, c.chat_id , m.message 
		FROM public.chat c 
         	INNER JOIN public.users u 
			ON u.id = c.user_id
       	INNER JOIN (SELECT DISTINCT ON (m.chat_id) m.chat_id , m.message 
       				FROM public.message m 
	  				ORDER BY m.chat_id ,m.delivered_time DESC) m 
			ON c.chat_id = m.chat_id 
       	WHERE u.id = '${req.params.id}'
       	ORDER BY c.chat_id DESC `);
    res.send(result.rows);
});

module.exports = router;