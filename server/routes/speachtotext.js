// Imports the Google Cloud client library
const speech = require("@google-cloud/speech");
const fs = require("fs");
const pool = require("../connection");
const moment = require("moment");
// Creates a client
const client = new speech.SpeechClient();

async function quickstart(res, filename, chat_id) {
  // The path to the remote LINEAR16 file

  // const filename = "../uploads/voice-1653231415804.m4a.wav";
  // const filename = "../uploads/sample1.mp3";

  const filename1 =
    "G:\\Development\\gradproj_backend\\graduation_project\\server\\uploads\\" +
    "dova.m4a";

  const file = fs.readFileSync(filename);
  const audioBytes = file.toString("base64");
  console.log(filename);
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 44100,
    languageCode: "en-US",
    audioChannelCount: 2,
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  console.log(response);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);

  var delivered_time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  pool.query(`INSERT INTO  public.message (message, delivered_time, chat_id, sender) 
                VALUES ('${transcription}', '${delivered_time}', '${chat_id}', 'false') `);
  res.json({ text: transcription });
}

module.exports = quickstart;
