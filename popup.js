document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(button.dataset.tab + "Tab").classList.add("active");
        });
    });

    // Load selected text
    chrome.storage.local.get("selectedText", (data) => {
        const text = data.selectedText || "Select some text on a webpage first.";
        const preview = text.length > 80 ? text.slice(0, 80) + "..." : text;

        document.getElementById("summary-preview").innerText = preview;
        document.getElementById("translate-preview").innerText = preview;
    });

    // Summarize button
    document.getElementById("summarize-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const resultBox = document.getElementById("summary-result");

            resultBox.innerText = "Summarizing...";
            try {
                const output = await window.summarizeWithAI(text);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Summarize error:", err);
                resultBox.innerText = "Error summarizing text.";
            }
        });
    });

    // Translate button
    document.getElementById("translate-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const resultBox = document.getElementById("translate-result");

            const fromLang = document.getElementById("from-lang").value;
            const toLang = document.getElementById("to-lang").value;
            console.log(fromLang, "------", toLang)
            resultBox.innerText = "Translating...";
            try {
                const output = await window.translateWithAI(text, fromLang, toLang);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Translate error:", err);
                resultBox.innerText = "Error translating text.";
            }
        });
    });
});
