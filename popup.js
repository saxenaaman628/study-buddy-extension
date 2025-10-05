document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettings = document.getElementById("close-settings");

    // --- User settings ---
    let userSettings = {
        showContext: true,
        defaultTone: "as-is",
        showDetectedLang: true
    };

    chrome.storage.local.get(
        ["showContext", "defaultTone", "showDetectedLang"],
        (data) => {
            userSettings = { ...userSettings, ...data };

            document.querySelectorAll(".context-box").forEach((el) => {
                el.classList.toggle("hidden", !userSettings.showContext);
            });
            document.getElementById("default-tone").value = userSettings.defaultTone;
            document.getElementById("show-context-box").checked = userSettings.showContext;
            document.getElementById("show-detected-lang").checked = userSettings.showDetectedLang;

            // Apply default tone to dropdown
            document.getElementById("rewrite-tone").value = userSettings.defaultTone;
        }
    );

    // --- Tab switching ---
    const updatePreview = (tabId) => {
        chrome.storage.local.get("selectedText", (data) => {
            const text = data.selectedText || "";
            const previewBox = document.getElementById(`${tabId}-preview`);
            if (previewBox) {
                previewBox.innerText =
                    text.length > 80 ? text.slice(0, 80) + "..." : text;
            }
        });
    };

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.dataset.tab;

            tabButtons.forEach((b) => b.classList.remove("active"));
            tabContents.forEach((c) => c.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(`${tabId}Tab`).classList.add("active");

            updatePreview(tabId);
        });
    });

    ["summary", "translate", "proofread", "rewriter"].forEach(updatePreview);

    // --- Summarize ---
    document.getElementById("summarize-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const contextInput = document.getElementById("summary-context");
            const context = userSettings.showContext
                ? contextInput?.value || "Summarize this text to help students learn faster, using simple key points."
                : "Summarize this text to help students learn faster, using simple key points.";
            const resultBox = document.getElementById("summary-result");

            resultBox.innerText = "Summarizing...";
            try {
                const output = await window.summarizeWithAI(text, context);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Summarize error:", err);
                resultBox.innerText = "Error summarizing text.";
            }
        });
    });

    // --- Translate ---
    document.getElementById("translate-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const resultBox = document.getElementById("translate-result");
            const toLang = document.getElementById("to-lang").value || "en";

            resultBox.innerText = "Detecting language...";

            try {
                let fromLang = "en"; // fallback
                if ('LanguageDetector' in self) {
                    const detector = await LanguageDetector.create({
                        monitor(m) {
                            m.addEventListener('downloadprogress', (e) => {
                                console.log(`Downloaded ${e.loaded * 100}%`);
                            });
                        },
                    });
                    const detected = await detector.detect(text);
                    fromLang = detected[0]?.detectedLanguage || "en";
                }

                resultBox.innerText = `Detected ${fromLang.toUpperCase()} → ${toLang.toUpperCase()}...`;
                const output = await window.translateWithAI(text, fromLang, toLang);
                resultBox.innerText = output;

            } catch (err) {
                console.error("Translate error:", err);
                resultBox.innerText = "Error translating text.";
            }
        });
    });

    // --- Proofread ---
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

    // --- Rewrite ---
    document.getElementById("rewriter-btn").addEventListener("click", async () => {
        chrome.storage.local.get("selectedText", async (data) => {
            const text = data.selectedText || "No text selected.";
            const tone = document.getElementById("rewrite-tone")?.value || userSettings.defaultTone;
            const format = document.getElementById("rewrite-format")?.value || "as-is";
            const contextInput = document.getElementById("rewrite-context");
            const context = userSettings.showContext
                ? contextInput?.value || ""
                : "";

            const resultBox = document.getElementById("rewriter-result");
            resultBox.innerText = "Rewriting...";

            try {
                const output = await window.rewriteWithAI(`${context}\n${text}`, tone, format, context);
                resultBox.innerText = output;
            } catch (err) {
                console.error("Rewrite error:", err);
                resultBox.innerText = "Error rewriting text.";
            }
        });
    });

    // --- Settings modal ---
    settingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
    closeSettings.addEventListener("click", () => {
        userSettings.showContext = document.getElementById("show-context-box").checked;
        userSettings.defaultTone = document.getElementById("default-tone").value;
        userSettings.showDetectedLang = document.getElementById("show-detected-lang").checked;

        chrome.storage.local.set(userSettings);

        document.querySelectorAll(".context-box").forEach((el) => {
            el.classList.toggle("hidden", !userSettings.showContext);
        });

        settingsModal.classList.add("hidden");
    });
});
