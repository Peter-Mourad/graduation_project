const express = require("express");

const auth = require("./middlewares/auth");
const jwt = require("./middlewares/JWT");

const home = require('./routes/home')
const register = require('./routes/register')
const login = require('./routes/login')
const refresh_token = require('./routes/regenerate_token')
const reset_password = require('./routes/reset_passwrod')
const paulo_testing = require("./routes/pauloTesting")

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/home', home)
app.use('/register', register)
app.use('/login', login)
app.use('/refresh', refresh_token)
app.use('/reset-password', reset_password)
app.use("/paulo", paulo_testing)

app.listen(
  process.env.PORT,
  console.log(`listening on port ${process.env.PORT}...`)
);
