const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

router.use(express.json());

router.post("/", (req, res) => {
    const refresh_token = req.body.refresh_token;
    jwt.verify(refresh_token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).send({ error: "refresh token isn't valid" });
        }

        const access_token = jwt.sign(
          { id: decoded.id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME }
        );
        return res.send({ access_token: access_token });
    });
});

module.exports = router;
