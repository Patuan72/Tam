document.getElementById("download").addEventListener("click", function () {
    const content = document.getElementById("text").value;
    const filename = "downloaded.html";
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    // Hiển thị tên file đã tải và gán link
    const linkDiv = document.getElementById("download-name");
    linkDiv.innerHTML = `<a href="${url}" target="_blank">${filename}</a>`;
});

// Đăng ký service worker (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('SW registered', reg))
        .catch(err => console.error('SW registration failed', err));
}