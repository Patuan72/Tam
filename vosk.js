
// Fake vosk.js placeholder (for offline PWA testing)
// You must replace this with the real vosk.js from https://github.com/alphacep/vosk-browser

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
