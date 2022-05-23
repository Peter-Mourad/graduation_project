// for Testing purposes
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const multer = require("multer");
const path = require("path");
const pool = require("../connection");
const moment = require("moment");
const fromFile = require("../configs/SpeachRecognition");
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
      console.log("Processing: " + progress.targetSize + " KB converted");
      if (progressing) {
        progressing(progress.targetSize);
      }
    })
    .on("end", () => {
      console.log("converting format finished !");
      if (finish) {
        finish();
      }
    })
    .save(destination);
}

const Router = require("express").Router();
Router.post("/upload-voice", upload.single("voice"), (req, res) => {
  console.log(req.body);
  const messageToBeReturned = "That is okay, it will be ready in 30 min";
  var delivered_time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  pool.query(`INSERT INTO  public.message (message, delivered_time, chat_id, sender) 
                VALUES ('${messageToBeReturned}', '${delivered_time}', '${req.body.chat_id}', 'false') `);
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
      const obj = fromFile(
        "G:\\Development\\gradproj_backend\\graduation_project\\server\\uploads\\" +
          req.file.filename +
          ".wav"
        // (text) => {
        //   res.json({ text });
        // }
      ); // make it syncabla
      // delete the records after use
      // console.log(obj);
    }
  );
  res.json({ text: messageToBeReturned });
});

Router.post("/suggestion", (req, res) => {
  let commingText = req.body.text;
  res.json({ suggestion: "is a suggestion" });
});

module.exports = Router;
