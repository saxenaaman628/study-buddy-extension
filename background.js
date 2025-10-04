chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "summarize",
        title: "Summarize Text",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "translate",
        title: "Translate Text",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "proofread",
        title: "Proofread Text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (["summarize", "translate", "proofread"].includes(info.menuItemId)) {
        chrome.storage.local.set({
            selectedText: info.selectionText,
            selectedAction: info.menuItemId
        });
    }
});
