
document.getElementById("download-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const htmlContent = document.getElementById("html-input").value.trim();
  const fileName = "downloaded.html";

  if (htmlContent === "") {
    alert("Vui lòng nhập nội dung HTML.");
    return;
  }

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  // Hiển thị tên file tải về kèm liên kết
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.textContent = fileName;
  li.appendChild(link);

  document.getElementById("downloaded-files").appendChild(li);
});
