
document.addEventListener("DOMContentLoaded", function () {
  const downloadButtons = document.querySelectorAll(".download-btn");
  const downloadedList = document.getElementById("downloadedList");

  downloadButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const id = event.target.getAttribute("data-id");

      if (id === "vpm-en") {
        const htmlContent = `
          <html>
            <head><meta charset="UTF-8"><title>VPM Sample</title></head>
            <body>
              <h1>Hello! How are you today?</h1>
              <p>I'm fine, thank you. And you?</p>
            </body>
          </html>
        `;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const fileName = "vpm-sample.html";

        // Tải về
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        // Hiển thị tên + link mở lại
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = url;
        link.textContent = fileName;
        link.target = "_blank";
        li.appendChild(link);
        downloadedList.appendChild(li);
      }
    });
  });
});
