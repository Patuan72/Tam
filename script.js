
document.getElementById('fileLinks').addEventListener('click', function(e) {
  if (e.target.tagName === 'A') {
    const fileName = e.target.textContent.trim();
    document.getElementById('downloadedFileName').textContent = "Đã tải: " + fileName;
  }
});
