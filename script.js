
let currentSentence = "";
let recognition;
let isRecording = false;

// Clean text: remove punctuation, lowercase
function clean(text) {
    return text.toLowerCase().replace(/[.,!?]/g, "").trim();
}

// So sánh và tính điểm
function compareSentences(expected, actual) {
    const expectedWords = clean(expected).split(" ");
    const actualWords = clean(actual).split(" ");
    let match = 0;
    expectedWords.forEach((word, i) => {
        if (actualWords[i] && actualWords[i] === word) match++;
    });
    return Math.round((match / expectedWords.length) * 100);
}

// Ghi âm và nhận dạng giọng nói
function startRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Trình duyệt không hỗ trợ Speech Recognition.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("result").innerText = "Bạn nói: " + transcript;

        const score = compareSentences(currentSentence, transcript);
        document.getElementById("score").innerText = "Điểm: " + score;
    };

    recognition.onerror = function(event) {
        console.error("Lỗi nhận diện:", event.error);
    };

    recognition.start();
    isRecording = true;
}

// Phát lại mẫu câu
function playSample(text) {
    currentSentence = text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Gắn sự kiện khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("startBtn").addEventListener("click", () => {
        startRecognition();
    });

    document.getElementById("playBtn").addEventListener("click", () => {
        const sentence = document.getElementById("sample").innerText;
        playSample(sentence);
    });
});
