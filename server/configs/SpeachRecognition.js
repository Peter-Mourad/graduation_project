require("dotenv").config();
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SUB_KEY,
  process.env.REGION
);
speechConfig.speechRecognitionLanguage = "en-US";

function fromFile(filePath) {
  console.log("here", filePath);
  let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(filePath));
  let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  speechRecognizer.recognizeOnceAsync((result) => {
    switch (result.reason) {
      case sdk.ResultReason.RecognizedSpeech:
        console.log(`RECOGNIZED: Text=${result.text}`);
        return { isSuccessful: true, text: result.text };

      case sdk.ResultReason.NoMatch:
        console.log("NOMATCH: Speech could not be recognized.");
        return { isSuccessful: false, text: null };
      case sdk.ResultReason.Canceled:
        const cancellation = sdk.CancellationDetails.fromResult(result);
        console.log(`CANCELED: Reason=${cancellation.reason}`);

        if (cancellation.reason == sdk.CancellationReason.Error) {
          console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
          console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
          console.log(
            "CANCELED: Did you set the speech resource key and region values?"
          );
        }
        return { isSuccessful: false, text: null };
    }
    speechRecognizer.close();
  });
}
module.exports = fromFile;
