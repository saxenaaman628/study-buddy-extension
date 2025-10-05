async function summarizeWithAI(text) {
    if (!window.Summarizer) {
        console.error("Summarizer API not available in this browser.");
        return "Summarizer API not available.";
    }

    try {
        // Options based on official docs
        const options = {
            sharedContext: "Study Buddy Extension",
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            expectedInputLanguages: ["en-US"],
            outputLanguage: "en",
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    console.log(`Downloaded ${(e.loaded * 100).toFixed(2)}%`);
                });
            }
        };

        // Check availability
        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            return "Summarizer API unavailable.";
        }

        // Only create summarizer if user activated
        if (navigator.userActivation.isActive) {
            const summarizer = await window.Summarizer.create(options);
            const result = await summarizer.summarize(text, { contex: "This is to helps students study faster and understand better. It turns long text into short, simple points, highlights the most important ideas, and explains everything in easy English." });

            // result may be string or object
            console.log(result)
            return result?.summary || result?.output || JSON.stringify(result);
        } else {
            return "Summarizer requires user interaction.";
        }

    } catch (err) {
        console.error("Summarizer API error:", err);
        return "Failed to summarize text.";
    }
}

async function translateWithAI(text, fromLang = "en", targetLang = "en") {
    if (!window.Translator) {
        console.error("Translator API not available in this browser.");
        return "Translator API not available.";
    }

    try {
        const translator = await window.Translator.create({
            sourceLanguage: fromLang,
            targetLanguage: targetLang,
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    console.log(`Downloaded ${e.loaded * 100}%`);
                });
            },
        });

        const result = await translator.translate(text);
        return result || "Translation failed.";
    } catch (err) {
        console.error("Translator API error:", err);
        return "Failed to translate text.";
    }
}

window.translateWithAI = translateWithAI;
window.summarizeWithAI = summarizeWithAI;
