const jwt = require("jsonwebtoken");

const VerifyToken = function (req, res, next) {
    const access_token = req.headers.access_token;
    if (!access_token) {
        return res.status(403).send({ error: 'access token is required!' })
    }
    jwt.verify(access_token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.send({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

module.exports = VerifyToken