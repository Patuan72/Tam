
// Auto load HTML book content into content box (main screen)
async function loadBook(zipUrl) {
    const response = await fetch(zipUrl);
    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);

    // Extract index.html
    const indexHtml = await zip.file("index.html").async("string");
    const contentBox = document.getElementById("content-box");
    if (contentBox) {
        contentBox.innerHTML = indexHtml;

        // Update audio file references (if needed)
        const audioElements = contentBox.querySelectorAll("audio, source");
        audioElements.forEach(el => {
            if (el.src && el.src.startsWith("audio/")) {
                const filename = el.src.split("/").pop();
                zip.file("audio/" + filename).async("blob").then(audioBlob => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    el.src = audioUrl;
                });
            }
        });
    }
}
