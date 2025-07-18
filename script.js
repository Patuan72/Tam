
function saveHtmlFile() {
    const uploadedHtmlContent = document.getElementById('uploadedHtml').value;
    if (!uploadedHtmlContent) return;

    const blob = new Blob([uploadedHtmlContent], { type: 'text/html' });
    const fileName = 'tai_lieu.html';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();

    // Hiển thị tên file đã tải xuống kèm link
    const downloadInfo = document.getElementById('downloadInfo');
    downloadInfo.innerHTML = `
        <p style="margin-top:10px;">📂 <a href="${a.href}" target="_blank">${fileName}</a> đã được tải xuống.</p>
    `;
}


// Tạo và đăng ký Service Worker trực tiếp
if ('serviceWorker' in navigator) {
    const swCode = `
        self.addEventListener('install', event => {
            self.skipWaiting();
        });
        self.addEventListener('fetch', function(event) {
            event.respondWith(fetch(event.request));
        });
    `;
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swURL = URL.createObjectURL(blob);
    console.log('Registering service worker...');
navigator.serviceWorker.register(swURL).then(reg => {
        console.log('SW registered via blob:', reg.scope);
    }).catch(err => {
        console.error('SW registration failed:', err);
    });
}

console.log('Script loaded successfully');