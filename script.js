
// indexedDB setup
let db;
const request = indexedDB.open("VPM_DB", 1);

request.onerror = () => console.error("DB error");
request.onsuccess = (event) => {
    db = event.target.result;
    loadDownloaded();
};
request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("files", { keyPath: "name" });
};

// Add a sample offline file
function saveSample() {
    const content = '<h1>Giáo trình Offline</h1><p>Nội dung được lưu để xem offline.</p>';
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    store.put({ name: "Giáo trình", content });
    loadDownloaded();
}

// Load downloaded list
function loadDownloaded() {
    const list = document.getElementById("downloadedList");
    list.innerHTML = "";
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    store.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.textContent = cursor.value.name;
            li.onclick = () => showContent(cursor.value.content);
            list.appendChild(li);
            cursor.continue();
        }
    };
}

// Display iframe content
function showContent(html) {
    document.getElementById("contentFrame").srcdoc = html;
    document.getElementById("contentFrameSection").classList.remove("hidden");
}

// Auto-save on first load
window.addEventListener("load", () => {
    setTimeout(saveSample, 1000);
});
