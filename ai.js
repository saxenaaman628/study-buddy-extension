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
            // monitor(m) {
            //     m.addEventListener('downloadprogress', (e) => {
            //         console.log(`Downloaded ${(e.loaded * 100).toFixed(2)}%`);
            //     });
            // }
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
async function proofreadWithAI(text) {
    if (!window.ai || !ai.proofreader) {
        console.error("Proofreader API not available in this version of Chrome.");
        return "Proofreader API not available in this version of Chrome."
    }

    try {
        const session = await ai.proofreader.create();
        const result = await session.proofread(text);

        if (result && result.corrections && result.corrections.length > 0) {
            return result.corrections.map(c => c.correctedText).join("\n");
        } else {
            return "No issues found.";
        }
    } catch (err) {
        console.error("Proofreader error:", err);
        return "Error during proofreading.";
    }
};

async function rewriteWithAI(text, tone = "as-is", outputFormat = "as-is") {
    if (!window.Rewriter) {
        console.error("Rewriter API not available in this Chrome version.");
        return "Rewriter API not available.";
    }
    try {
        const options = {
            type: "paraphrase",
            style: tone,        // use selected tone
            format: outputFormat, // use selected format
            // length:"short",
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    console.log(`Downloaded ${(e.loaded * 100).toFixed(2)}%`);
                });
            }
        };

        const availability = await Rewriter.availability();
        if (availability === "unavailable") {
            return "Rewriter API unavailable.";
        }

        if (navigator.userActivation.isActive) {
            const rewriter = await Rewriter.create(options);
            const result = await rewriter.rewrite(text);
            return result?.output || JSON.stringify(result);
        } else {
            return "Rewriter requires user interaction.";
        }
    } catch (err) {
        console.error("Rewriter API error:", err);
        return "Failed to rewrite text.";
    }
}

window.rewriteWithAI = rewriteWithAI;
window.translateWithAI = translateWithAI;
window.summarizeWithAI = summarizeWithAI;
window.proofreadWithAI = proofreadWithAI;