document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("libraryModal").classList.remove("hidden");
  loadDownloadedFiles();
});

document.getElementById("backBtn").addEventListener("click", () => {
  document.getElementById("libraryModal").classList.add("hidden");
});

// IndexedDB setup
let db;
const request = indexedDB.open("GiaoTrinhDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("htmlFiles", { keyPath: "name" });
};

request.onsuccess = (event) => {
  db = event.target.result;
};

function loadDownloadedFiles() {
  const transaction = db.transaction("htmlFiles", "readonly");
  const store = transaction.objectStore("htmlFiles");
  const request = store.getAll();

  request.onsuccess = () => {
    const downloadedList = document.getElementById("downloadedList");
    downloadedList.innerHTML = "";
    request.result.forEach(file => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = file.name;
      a.onclick = () => {
        const blob = new Blob([file.content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        document.getElementById("previewFrame").src = url;
      };
      li.appendChild(a);
      downloadedList.appendChild(li);
    });
  };
}
