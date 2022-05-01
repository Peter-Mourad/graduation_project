const express = require('express')
const app = express()
const chats = require('./routes/chats')
const register = require('./routes/register')
app.use('/chats', chats)
app.use('/register', register)

app.listen(process.env.port, console.log(`listening on port ${process.env.port}...`))