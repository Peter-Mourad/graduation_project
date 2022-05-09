const express = require('express')
const chats = require('./routes/chats')
const register = require('./routes/register')
const login = require('./routes/login')
require('dotenv').config()

const app = express()
app.use('/chats', chats)
app.use('/register', register)
app.use('/login', login)
app.use(express.json())

app.listen(process.env.PORT, console.log(`listening on port ${process.env.PORT}...`))