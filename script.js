document.getElementById('download-btn').addEventListener('click', function () {
  const text = document.getElementById('input-text').value;
  const filename = 'downloaded.html';
  const blob = new Blob([text], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Tạo và click nút tải về
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // Hiện tên file (kèm link mở lại)
  const fileList = document.getElementById('file-list');
  const fileLink = document.createElement('a');
  fileLink.href = url;
  fileLink.textContent = filename;
  fileLink.target = '_blank'; // Mở tab mới
  fileLink.style.textDecoration = 'underline';

  const listItem = document.createElement('li');
  listItem.appendChild(fileLink);
  fileList.appendChild(listItem);
});