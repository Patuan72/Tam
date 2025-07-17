
function downloadAndMark() {
    localStorage.setItem("vpm_tieng_anh", "downloaded");
    alert("Đã tải thành công!");
    location.reload();
}

function load() {
    alert("Đã nạp vào.");
}

window.onload = function() {
    const isDownloaded = localStorage.getItem("vpm_tieng_anh") === "downloaded";
    if (isDownloaded) {
        document.getElementById("downloaded").innerHTML = '<p>📘 VPM - tiếng Anh (Đã tải)</p>';
    }
};
