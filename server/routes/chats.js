const express = require('express')
const router = express.Router()
const pool = require('../connection')

router.get('/:id', (req, res) => {
    pool.query(`select chat_id from public.chat
                where user_id = ${req.params.id}`, (err, result) => {
        if (err) {
            return res.send({ error: err.message })
        }
        return res.send(results.rows)
    })
})

router.post('/:id', (req, res) => {
    pool.query(`insert into public.chat (user_id) 
                VALUES (${req.params.id})`, (err, result) => {
        if (err) {
            return res.send({ error: err.message })
        }
        return res.send(results.rows)
    })
})

module.exports = router