// for Testing purposes
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const multer = require("multer");
const path = require("path");
const pool = require("../connection");
const moment = require("moment");
const fromFile = require("../configs/SpeachRecognition");
const quickstart = require("../routes/speachtotext");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".m4a");
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: { filesize: 1024 * 1024 * 5 },
});

function convertFileFormat(file, destination, error, progressing, finish) {
  ffmpeg(file)
    .on("error", (err) => {
      console.log("An error occurred: " + err.message);
      if (error) {
        error(err.message);
      }
    })
    .on("progress", (progress) => {
      // console.log(JSON.stringify(progress));
      // console.log("Processing: " + progress.targetSize + " KB converted");
      if (progressing) {
        progressing(progress.targetSize);
      }
    })
    .on("end", () => {
      // console.log("converting format finished !");
      if (finish) {
        finish();
      }
    })
    .save(destination);
}

const Router = require("express").Router();
Router.post("/upload-voice", upload.single("voice"), (req, res) => {
  console.log("body!!!", req.body);
  // pool.query(`INSERT INTO  public.message (message, delivered_time, chat_id, sender)
  //               VALUES ('${messageToBeReturned}', '${delivered_time}', '${req.body.chat_id}', 'false') `);
  // console.log("body", req.file);
  convertFileFormat(
    "G:\\Development\\gradproj_backend\\graduation_project\\server\\uploads\\" +
      req.file.filename,
    "G:\\Development\\gradproj_backend\\graduation_project\\server\\uploads\\" +
      req.file.filename +
      ".wav",
    function (errorMessage) {},
    null,
    async function () {
      quickstart(
        res,
        "G:\\Development\\gradproj_backend\\graduation_project\\server\\uploads\\" +
          req.file.filename +
          ".wav",
        req.body.chat_id
      );
    }
  );

  // res.json({ text: messageToBeReturned });
});

Router.post("/suggestion", (req, res) => {
  let commingText = req.body.text;
  commingText = commingText.toLowerCase();
  let suggestion = "";
  if (commingText.includes("can i"))
    suggestion = "order a beef burger, please!";
  else if (commingText.includes("i want")) suggestion = "to make an order";
  else if (commingText.includes("my favourite"))
    suggestion =
      "toppings is tomatoes and onion rings, with fried potatoes as a side dish";
  else if (commingText.includes("okay")) suggestion = ", thank you so much";
  res.json({ suggestion });
});

module.exports = Router;
