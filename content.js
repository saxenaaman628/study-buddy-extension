document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0 && chrome.storage) {  // check chrome.storage exists
        chrome.storage.local.set({ selectedText });
    }
});
