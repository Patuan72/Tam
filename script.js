
let db;
const request = indexedDB.open("curriculumDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("files", { keyPath: "name" });
};

request.onsuccess = function (event) {
  db = event.target.result;
  showFiles();
};

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    store.put({ name: file.name, content: reader.result });
    transaction.oncomplete = showFiles;
  };
  reader.readAsText(file);
});

function showFiles() {
  const list = document.getElementById("fileList");
  list.innerHTML = "";
  const transaction = db.transaction(["files"], "readonly");
  const store = transaction.objectStore("files");
  const request = store.openCursor();
  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const li = document.createElement("li");
      li.textContent = cursor.value.name;
      li.onclick = () => {
        const iframe = document.getElementById("viewer");
        const blob = new Blob([cursor.value.content], { type: "text/html" });
        iframe.src = URL.createObjectURL(blob);
      };
      list.appendChild(li);
      cursor.continue();
    }
  };
}
