document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const listItem = document.createElement('li');
  listItem.textContent = file.name;
  listItem.addEventListener('click', () => {
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('lessonContent').textContent = reader.result;
    };
    reader.readAsText(file);
  });

  document.getElementById('fileList').appendChild(listItem);
});
