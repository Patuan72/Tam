recognition.onerror = e => {
      transcriptBox.textContent = "❌ Lỗi: " + e.error;
      scoreBox.textContent = "0";
    };
  }

  function clean(text) {
    return text.toLowerCase().replace(/[.,!?]/g, "").trim();
  }

  function compareSentences(expected, actual) {
    const expectedWords = clean(expected).split(" ");
    const actualWords = clean(actual).split(" ");
    let match = 0;
    expectedWords.forEach((word, i) => {
      if (actualWords[i] && actualWords[i] === word) match++;
    });
    return Math.round((match / expectedWords.length) * 100);
  }
});
