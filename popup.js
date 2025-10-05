document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    // Function to update preview for a tab
    const updatePreview = (tabId) => {
        chrome.storage.local.get("selectedText", (data) => {
            const text = data.selectedText || "Select some text on a webpage first.";
            const previewBox = document.getElementById(`${tabId}-preview`);
            if (previewBox) {
                previewBox.innerText = text.length > 80 ? text.slice(0, 80) + "..." : text;
            }
        });
    };

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.dataset.tab;

            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(`${tabId}Tab`).classList.add("active");

            updatePreview(tabId);
        });
    });

    // Initialize all previews
    ["summary", "translate", "proofread", "rewriter"].forEach(updatePreview);

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

    // Proofread button
    document.getElementById("proofread-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const resultBox = document.getElementById("proofread-result");
            resultBox.innerText = "Proofreading...";
            try {
                const output = await window.proofreadWithAI(text);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Proofread error:", err);
                resultBox.innerText = "Error proofreading text.";
            }
        });
    });

    // Rewriter button
    document.getElementById("rewriter-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const resultBox = document.getElementById("rewriter-result");

            const tone = document.getElementById("rewrite-tone").value;
            const format = document.getElementById("rewrite-format").value;

            resultBox.innerText = "Rewriting...";
            try {
                const output = await window.rewriteWithAI(text, tone, format);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Rewrite error:", err);
                resultBox.innerText = "Error rewriting text.";
            }
        });
    });
});
