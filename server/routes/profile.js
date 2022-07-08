const express = require("express");
const app = express();
const router = express.Router();
const pool = require("../connection");
const auth = require("../middlewares/auth");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

router.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../server/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".png");
  },
});

const upload = multer({
  storage: storage,
});

router.post("/upload-image", auth, upload.single("image"), (req, res) => {
  image_link = `http://192.168.63.231:5000/${req.file.filename}`;
  pool.query(
    `UPDATE public.users
                SET profile_picture = '${image_link}'
                WHERE id = '${req.user.id}'`,
    (err, result) => {
      if (err) return res.status(400).send({ error: err.message });
      return res.sendStatus(200);
    }
  );
});

router.get("/", auth, (req, res) => {
  pool.query(
    `SELECT u.first_name ,u.last_name ,u.username ,u.email ,u.gender ,u.profile_picture
                FROM public.users u 
                WHERE u.id = '${req.user.id}'`,
    (err, result) => {
      if (err) return res.status(400).send({ error: err.message });
      return res.send(result.rows[0]);
    }
  );
});

router.post("/edit", auth, (req, res) => {
  //validate new field
  const schema = Joi.object({
    username: Joi.string().pattern(new RegExp("^[A-Za-z][A-Za-z0-9_]{7,29}$")),
    first_name: Joi.string().pattern(new RegExp("^[A-Za-z]{3,30}$")),
    last_name: Joi.string().pattern(new RegExp("^[A-Za-z]{3,30}$")),
  });
  const validateSchema = schema.validate(
    JSON.parse(`{"${req.body.field}": "${req.body.data}"}`)
  );
  if (validateSchema.error) {
    return res.status(400).send({ error: `${req.body.field} isn't valid` });
  }

  pool.query(
    `UPDATE public.users
                SET ${req.body.field} = '${req.body.data}'
                WHERE id = '${req.user.id}'`,
    (err, result) => {
      if (err) return res.status(400).send({ error: err.message });
      return res.sendStatus(200);
    }
  );
});

module.exports = router;
