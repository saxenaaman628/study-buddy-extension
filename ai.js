async function detectLanguage(text) {
    try {
        if ("LanguageDetector" in self) {
            const detector = await LanguageDetector.create({
                monitor(m) {
                    m.addEventListener("downloadprogress", (e) => {
                        console.log(`Language model download: ${(e.loaded * 100).toFixed(2)}%`);
                    });
                },
            });

            const results = await detector.detect(text);
            if (results && results.length > 0) {
                const best = results[0];
                console.log("Detected language:", best.detectedLanguage, "Confidence:", best.confidence);
                return best.detectedLanguage; // ISO code (like 'en', 'de', 'hi')
            }
        }

        console.warn("LanguageDetector API unavailable or returned empty results.");
        return fallbackLanguageDetection(text);

    } catch (err) {
        console.error("Language detection error:", err);
        return fallbackLanguageDetection(text);
    }
}

// Simple fallback (uses heuristics)
function fallbackLanguageDetection(text) {
    const trimmed = text.trim();
    if (!trimmed) return "en";

    // Basic heuristic rules
    if (/[अ-ह]/.test(trimmed)) return "hi"; // Hindi
    if (/[а-яА-Я]/.test(trimmed)) return "ru"; // Russian
    if (/[äöüß]/i.test(trimmed)) return "de"; // German
    if (/[áéíóúñ]/i.test(trimmed)) return "es"; // Spanish
    if (/[èéêàç]/i.test(trimmed)) return "fr"; // French

    // Default fallback
    return "en";
}

async function summarizeWithAI(text, context = "Summarize this text to help students learn faster, using simple key points.") {
    if (!window.Summarizer) {
        console.error("Summarizer API not available in this browser.");
        return "Summarizer API not available.";
    }
    try {
        const options = {
            sharedContext: context,
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            expectedInputLanguages: ["en-US"],
            outputLanguage: "en",
        };

        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            return "Summarizer API unavailable.";
        }

        if (navigator.userActivation.isActive) {
            const summarizer = await window.Summarizer.create(options);
            const contextualText = `${context}\n\n---\n\n${text}`
            const result = await summarizer.summarize(contextualText
                //     , {
                //     context: context
                // }
            );
            return result?.summary || result?.output || JSON.stringify(result);
        } else {
            return "Summarizer requires user interaction.";
        }

    } catch (err) {
        console.error("Summarizer API error:", err);
        return "Failed to summarize text.";
    }
}

async function translateWithAI(text, fromLang = "auto", targetLang = "en") {
    if (!window.Translator) {
        console.error("Translator API not available in this browser.");
        return "Translator API not available.";
    }

    try {
        // If auto-detect is chosen, detect language first
        if (fromLang === "auto") {
            fromLang = await detectLanguage(text);
            console.log("Auto-detected source language:", fromLang);
        }

        const translator = await window.Translator.create({
            sourceLanguage: fromLang,
            targetLanguage: targetLang,
            monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
                    console.log(`Downloaded ${(e.loaded * 100).toFixed(2)}%`);
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
        return "Proofreader API not available in this version of Chrome.";
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
}

async function rewriteWithAI(text, tone = "as-is", outputFormat = "as-is", context = "Avoid any toxic language and be as constructive as possible.") {
    if (!window.Rewriter) {
        console.error("Rewriter API not available in this Chrome version.");
        return "Rewriter API not available.";
    }

    try {
        const options = {
            type: "paraphrase",
            style: tone,
            format: outputFormat,
            monitor(m) {
                m.addEventListener("downloadprogress", (e) => {
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
            const result = await rewriter.rewrite(text, {
                context
            });
            return result?.output || JSON.stringify(result);
        } else {
            return "Rewriter requires user interaction.";
        }
    } catch (err) {
        console.error("Rewriter API error:", err);
        return "Failed to rewrite text.";
    }
}

// Expose globally
window.rewriteWithAI = rewriteWithAI;
window.translateWithAI = translateWithAI;
window.summarizeWithAI = summarizeWithAI;
window.proofreadWithAI = proofreadWithAI;
window.detectLanguage = detectLanguage;
