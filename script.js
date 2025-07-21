let audioContext;
let scriptProcessor;
let microphone;
let isRecording = false;
let features = [];

document.getElementById("record-button").addEventListener("click", async () => {
  if (!isRecording) {
    isRecording = true;
    features = [];
    document.getElementById("score").textContent = "...";

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    microphone = audioContext.createMediaStreamSource(stream);
    scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    const meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source: microphone,
      bufferSize: 2048,
      featureExtractors: ["rms"],
      callback: (feature) => {
        if (isRecording) features.push(feature.rms);
      },
    });

    meydaAnalyzer.start();
    microphone.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    setTimeout(() => {
      isRecording = false;
      meydaAnalyzer.stop();
      scriptProcessor.disconnect();
      audioContext.close();
      const avg = features.reduce((a, b) => a + b, 0) / features.length;
      const score = Math.min(100, Math.max(0, Math.round(avg * 2000)));
      document.getElementById("score").textContent = score;
    }, 3000);
  }
});