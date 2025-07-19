document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replay");
  const micBtn = document.getElementById("mic");
  const saveBtn = document.getElementById("save");
  const textarea = document.querySelector("textarea");

  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;

  replayBtn.addEventListener("click", () => {
    if (!audioBlob) {
      alert("Chưa có bản ghi âm nào để phát lại!");
      return;
    }
    replayBtn.textContent = "⏳";
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
    audio.onended = () => {
      replayBtn.textContent = "🔁";
    };
  });

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

  document.getElementById("menuBtn").addEventListener("click", () => {
    const lib = document.getElementById("library");
    lib.classList.toggle("hidden");
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("library").classList.add("hidden");
  });

  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      console.log('Tốc độ được chọn:', ['Chậm', 'Trung bình', 'Nhanh'][index]);
    });
  });

  // Xoá logic liên quan đến curriculumData và nạp nội dung mẫu
});


// Sau khi DOM đã load, thêm "Giáo trình" nếu chưa có
window.addEventListener("load", () => {
  const dbName = 'VPM_DB';
  const storeName = 'files';
  const content = `<html><body><h1>Chào mừng đến với Giáo trình</h1><p>Đây là nội dung mẫu của giáo trình bạn đã tải.</p></body></html>`;

  const openDB = indexedDB.open(dbName, 1);
  openDB.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const getReq = store.get("Giáo trình");
    getReq.onsuccess = () => {
      if (!getReq.result) {
        const txAdd = db.transaction(storeName, 'readwrite');
        txAdd.objectStore(storeName).put({ name: "Giáo trình", content });
        txAdd.oncomplete = () => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.textContent = "Giáo trình";
          a.href = '#';
          a.onclick = () => {
            const blob = new Blob([content], { type: 'text/html' });
            document.getElementById("viewer").src = URL.createObjectURL(blob);
          };
          li.appendChild(a);
          document.getElementById('downloadedList').appendChild(li);
        };
      }
    };
  };
});
