
let model;
let recognizer;
let Module;
let ready = false;

self.onmessage = async function (e) {
  if (e.data.command === "init") {
    importScripts("https://alphacephei.com/vosk/js/vosk.js");

    Module = await Vosk.createModel();
    const response = await fetch(e.data.modelUrl);
    const buffer = await response.arrayBuffer();
    const zipData = new Uint8Array(buffer);
    model = new Module.Model(zipData);
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
