
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
