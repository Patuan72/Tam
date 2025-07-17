document.getElementById('fileUpload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('fileName').innerText = file.name;
  }
});