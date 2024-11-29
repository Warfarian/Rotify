const replaceImages = () => {
    const imageUrl = chrome.runtime.getURL("chillguy.png");
    const images = document.querySelectorAll('img');

    images.forEach((img)=>{
         img.src = imageUrl;
         img.alt  = "When your image doesn't load, but you're just a chill guy"
    });
};

const replaceText = () => {
    const elements = document.body.querySelectorAll("*");
    
    elements.forEach((element) => {
        element.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const originalText = node.nodeValue.trim();
                if (originalText) {
                    const rotText = originalText
                        .toUpperCase()
                        .replace(/ /g, " THE ROT CONSUMES "); 
                    node.nodeValue = rotText;
                }
            }
        });
        element.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive";
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('skibidiBtn');
    if (button) {
        button.addEventListener('click', async () => {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Execute the functions in the content script context
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: replaceImages
            });
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: replaceText
            });
        });
    } else {
        console.warn('Nothing to skibidi here');
    }
});
