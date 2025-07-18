
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
