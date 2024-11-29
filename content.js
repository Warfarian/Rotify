const replaceMedia = () => {
    const imageUrl = chrome.runtime?.getURL?.("chillguy.png") || 
                    chrome.extension?.getURL?.("chillguy.png") || 
                    "chillguy.png";

    const mediaSelectors = [
        'img:not([data-rotified])',
        'video:not([data-rotified])',
        'iframe[src*="youtube"]:not([data-rotified])',
        'iframe[src*="vimeo"]:not([data-rotified])',
        'div[style*="background-image"]:not([data-rotified])',
        'source[type*="image"]:not([data-rotified])',
        'source[type*="video"]:not([data-rotified])',
        'gif:not([data-rotified])'
    ];
    const mediaElements = document.querySelectorAll(mediaSelectors.join(','));

    mediaElements.forEach((element) => {
        if (element.getAttribute('data-processing')) return;
        element.setAttribute('data-processing', 'true');
        
        const replacementImg = document.createElement('img');
        replacementImg.src = imageUrl;
        replacementImg.alt = "Just a chill guy";
        replacementImg.style.width = element.offsetWidth ? element.offsetWidth + 'px' : '100%';
        replacementImg.style.height = element.offsetHeight ? element.offsetHeight + 'px' : 'auto';
        replacementImg.setAttribute('data-rotified', 'true');

        if (element.tagName.toLowerCase() === 'div') {
            element.style.backgroundImage = `url(${imageUrl})`;
            element.setAttribute('data-rotified', 'true');
        } else {
            element.style.display = 'none';
            element.parentNode.insertBefore(replacementImg, element);
            element.setAttribute('data-rotified', 'true');
        }
        
        element.removeAttribute('data-processing');
    });
};

const replaceText = () => {
    const elements = document.body.querySelectorAll("*:not([data-rot-processed])");
    
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
        element.setAttribute('data-rot-processed', 'true');
    });
};

const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

const debouncedReplace = debounce(() => {
    replaceMedia();
    replaceText();
}, 100);

const observeDOM = () => {
    const observer = new MutationObserver((mutations) => {
        const shouldProcess = mutations.some(mutation => 
            mutation.addedNodes.length > 0 || 
            mutation.type === 'childList' ||
            mutation.target.tagName === 'IMG' ||
            mutation.target.tagName === 'VIDEO' ||
            mutation.target.tagName === 'IFRAME'
        );

        if (shouldProcess) {
            debouncedReplace();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'style']
    });
};

window.addEventListener('scroll', debouncedReplace, false);

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('skibidiBtn');
    if (button) {
        button.addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    replaceMedia();
                    replaceText();
                    observeDOM();
                }
            });
        });
    }
});