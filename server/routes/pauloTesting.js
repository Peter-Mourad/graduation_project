// for Testing purposes
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const multer = require("multer");
const path = require("path");
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
  //   console.log("body", req.file);
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
      ); // make it syncabla
      // delete the records after use
    }
  );

  res.json({ text: "this is your voice record you stupid shit bastered!" });
});

Router.post("/suggestion", (req, res) => {
  console.log(req.body);
  const text = req.body.text || null;

  console.log("here!", text);
  res.json({ suggestion: "this is the suggestion" });
});

module.exports = Router;
