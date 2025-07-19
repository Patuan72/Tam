
let db;
const request = indexedDB.open("GiaoTrinhDB", 1);

request.onerror = function (event) {
  console.error("Lỗi mở IndexedDB:", event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadSavedList();
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("giaoTrinh", { keyPath: "url" });
};

function fetchAndSave(url) {
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const tx = db.transaction("giaoTrinh", "readwrite");
      const store = tx.objectStore("giaoTrinh");
      store.put({ url, html });
      tx.oncomplete = () => {
        alert("Đã lưu giáo trình.");
        loadSavedList();
      };
    })
    .catch((error) => alert("Tải lỗi: " + error));
}

function loadSavedList() {
  const savedList = document.getElementById("saved-list");
  savedList.innerHTML = "";
  const tx = db.transaction("giaoTrinh", "readonly");
  const store = tx.objectStore("giaoTrinh");
  const request = store.getAll();
  request.onsuccess = function () {
    request.result.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" onclick="showSaved('${item.url}')">${item.url}</a>`;
      savedList.appendChild(li);
    });
  };
}

function showSaved(url) {
  const tx = db.transaction("giaoTrinh", "readonly");
  const store = tx.objectStore("giaoTrinh");
  const request = store.get(url);
  request.onsuccess = function () {
    const viewer = document.getElementById("viewer");
    viewer.srcdoc = request.result.html;
  };
}

function showLibrary() {
  document.getElementById("library").classList.remove("hidden");
}
function hideLibrary() {
  document.getElementById("library").classList.add("hidden");
}
function showSavedTab() {
  document.getElementById("saved").classList.remove("hidden");
  document.getElementById("remote").classList.add("hidden");
  document.getElementById("giaotrinh").classList.add("hidden");
}
function showRemote() {
  document.getElementById("remote").classList.remove("hidden");
  document.getElementById("saved").classList.add("hidden");
  document.getElementById("giaotrinh").classList.add("hidden");
}
function showGiaoTrinh() {
  document.getElementById("giaotrinh").classList.remove("hidden");
  document.getElementById("saved").classList.add("hidden");
  document.getElementById("remote").classList.add("hidden");
}
