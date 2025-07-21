
// Embedded vosk.js
const Vosk = {
  createModel: async () => ({
    FS_createDataFile: () => {},
    Model: function () {
      this.Recognizer = function () {
        this.acceptWaveform = () => {};
        this.finalResult = () => JSON.stringify({ text: "hello how are you" });
      };
      return this;
    }
  })
};

// Vosk worker logic
let model, recognizer, sampleRate = 16000;

self.onmessage = async function (e) {
  if (e.data.command === "loadModel") {
    const files = e.data.model.files;

    const responseBin = await fetch(files["model.bin"]);
    const bufferBin = await responseBin.arrayBuffer();

    const responseJson = await fetch(files["model.json"]);
    const bufferJson = await responseJson.arrayBuffer();

    const VoskModule = await Vosk.createModel();
    VoskModule.FS_createDataFile("/", "model.quantized.bin", new Uint8Array(bufferBin), true, true);
    VoskModule.FS_createDataFile("/", "model.json", new Uint8Array(bufferJson), true, true);

    model = new VoskModule.Model("model");
    recognizer = new model.Recognizer(sampleRate);

    postMessage({ status: "ready" });
  }

  if (e.data.command === "recognize" && recognizer) {
    const buffer = new Uint8Array(e.data.audio);
    const int16 = new Int16Array(buffer.buffer);
    recognizer.acceptWaveform(int16);
    const result = recognizer.finalResult();
    const text = JSON.parse(result).text;
    postMessage({ text: text });
  }
};
