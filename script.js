document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replay");
  const micBtn = document.getElementById("mic");
  const saveBtn = document.getElementById("save");
  const textarea = document.querySelector("textarea");

  // ======== 🔁 REPLAY - phát lại ghi âm gần nhất ========
  replayBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi âm nào để phát lại!");
      return;
    }
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
  });

  // ======== 🎤 MIC - ghi âm bằng MediaRecorder ========
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;

  micBtn.addEventListener("click", async () => {
    if (micBtn.textContent === "🎤") {
      micBtn.textContent = "🔴";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.play();
      };

      mediaRecorder.start();
    } else {
      micBtn.textContent = "🎤";
      mediaRecorder.stop();
    }
  });

  // ======== 💾 SAVE - lưu file âm thanh ========
  saveBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Bạn cần ghi âm trước khi lưu!");
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ghi-am.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    saveBtn.textContent = "✅";
    setTimeout(() => {
      saveBtn.textContent = "💾";
    }, 1000);
  });
});


// ===== 📂 MENU: Hiện/ẩn thư viện =====
document.getElementById("menuBtn").addEventListener("click", () => {
  const lib = document.getElementById("library");
  lib.classList.toggle("hidden");
});

// ===== 📘 Nội dung giáo trình mẫu =====
const curriculumData = {
  "vpm-en": "Hello! How are you today?\nI'm fine, thank you. And you?"
};

// ===== 📥 Tải giáo trình và nạp vào textarea =====
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("download-btn")) {
    const item = e.target.parentElement;
    const id = e.target.dataset.id;
    const downloadedList = document.getElementById("downloadedList");
    item.removeChild(e.target); // Xoá nút tải
    downloadedList.appendChild(item); // Chuyển sang mục đã tải

    // Nạp nội dung vào textarea
    if (curriculumData[id]) {
      document.querySelector("textarea").value = curriculumData[id];
      alert("Đã tải và nạp nội dung giáo trình vào màn hình học.");
    }
  }
});

// ===== 🔙 Nút quay lại =====
document.getElementById("backBtn").addEventListener("click", () => {
  document.getElementById("library").classList.add("hidden");
});

// ===== ⚡ SPEED SELECTION =====
document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
    console.log('Tốc độ được chọn:', ['Chậm', 'Trung bình', 'Nhanh'][index]);
  });
});
