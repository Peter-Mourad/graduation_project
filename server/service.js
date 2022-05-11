const express = require("express");
const chats = require("./routes/chats");
const register = require("./routes/register");
const login = require("./routes/login");
const paulo = require("./routes/pauloTesting"); // for Testing purposes
require("dotenv").config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/chats", chats);
app.use("/register", register);
app.use("/login", login);
app.use("/paulo", paulo); // for Testing purposes

app.listen(
  process.env.PORT,
  console.log(`listening on port ${process.env.PORT}...`)
);
