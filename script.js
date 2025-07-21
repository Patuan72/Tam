
let currentSentence = "";
let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startButton");
const scoreBox = document.getElementById("scoreBox");
const sentenceBox = document.getElementById("sentenceBox");
const micButton = document.getElementById("micButton");
const replayButton = document.getElementById("replayButton");

micButton.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
            audioChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = buffer.getChannelData(0);
        const features = Meyda.extract(['rms', 'zcr', 'spectralFlatness'], channelData);
        if (!features) return;
        const { rms, zcr, spectralFlatness } = features;

        let score = 100;
        score -= Math.min(40, Math.max(0, (0.025 - rms) * 1600));
        score -= Math.max(0, (zcr - 0.2) * 150);
        score -= Math.max(0, (spectralFlatness - 0.5) * 100);
        score = Math.max(0, Math.min(100, Math.round(score)));
        scoreBox.textContent = score;
    };

    mediaRecorder.start();
    setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
    }, 3000);
});
