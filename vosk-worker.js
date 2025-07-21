
let model, recognizer, Module;
let ready = false;

self.onmessage = async function (e) {
  if (e.data.command === "init") {
    importScripts("vosk.js"); // cần đặt vosk.js cạnh worker

    Module = await Vosk.createModel();
    Module.FS_createPreloadedFile("/", "model.json", "model/model.json", true, false);
    Module.FS_createPreloadedFile("/", "model.quantized.bin", "model/model.quantized.bin", true, false);

    model = new Module.Model("model");
    recognizer = new model.Recognizer(16000);
    ready = true;
    postMessage({ status: "ready" });
  }

  if (e.data.command === "process" && ready) {
    const audioBuffer = new Uint8Array(e.data.buffer);
    const int16Audio = new Int16Array(audioBuffer.buffer);
    recognizer.acceptWaveform(int16Audio);
    const result = recognizer.finalResult();
    const text = JSON.parse(result).text;
    postMessage({ text: text });
  }
};
