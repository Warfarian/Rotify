// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'transformText') {
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${window.config.GOOGLE_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: request.data
                    }]
                }]
            })
        })
        .then(response => response.json())
        .then(result => {
            sendResponse({success: true, data: result});
        })
        .catch(error => {
            sendResponse({success: false, error: error.toString()});
        });
        return true; 
    }
});

const loadConfig = () => {
    return new Promise((resolve, reject) => {
        if (window.config) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('config.js');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load config script'));
        (document.head || document.documentElement).appendChild(script);
    });
};

const rotifyApp = {
    // Simple debounce function
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // Replace images with memes
    replaceMedia: () => {
        const images = [
            "images/chillguy.png",
            "images/amogus.jpeg",
            "images/freak.jpg",
            "images/knee.jpeg",
            "images/lebron.png",
            "images/skibidi-toilet.jpg",
            "images/zucc.jpg",
            "images/squidwa.png",
            "images/the.JPG",
            "images/kneesurg.png",
            "images/pig.png",
            "images/thumbsup.png",
            "images/nah.png",
            "images/roblox.png",
            "images/mango.png",
            "images/thosewhoKnow.png",  
            "images/don.jpeg",
            "images/donpollo.png"
        ];

        const getRandomImage = () => {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            return chrome.runtime.getURL(randomImage);
        };

        const imageSelectors = [
            'img:not([data-rotified])',
            'div[style*="background-image"]:not([data-rotified])',
            '.thumbnail:not([data-rotified])',
            'div[class*="thumb"]:not([data-rotified])',
            'div[class*="avatar"]:not([data-rotified])',
            'div[class*="preview"]:not([data-rotified])',
            '.wp-post-thumbnail:not([data-rotified])',
            '.attachment-post-thumbnail:not([data-rotified])',
            'img[src*="framerusercontent"]:not([data-rotified])',
            'img[src*="framer"]:not([data-rotified])',
            '[style*="framerusercontent"]:not([data-rotified])'
        ];

        imageSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (element.tagName.toLowerCase() === 'img') {
                    const newImage = getRandomImage();
                    element.src = newImage;
                    element.srcset = '';
                    element.sizes = '';
                } else {
                    element.style.backgroundImage = `url('${getRandomImage()}')`;
                }
                element.setAttribute('data-rotified', 'true');
            });
        });
    },

    // Process page text
    processText: async () => {
        // Target a broader range of text-containing elements, but exclude already transformed ones
        const textElements = document.querySelectorAll('p:not(.rotified-text), h1:not(.rotified-text), h2:not(.rotified-text), h3:not(.rotified-text), h4:not(.rotified-text), h5:not(.rotified-text), h6:not(.rotified-text), span:not(.rotified-text), div:not(.rotified-text), a:not(.rotified-text), li:not(.rotified-text), td:not(.rotified-text), th:not(.rotified-text), label:not(.rotified-text), button:not(.rotified-text)');
        
        for (const element of textElements) {
            // Only process elements that directly contain text (not just child elements)
            if (element.childNodes.length === 1 && 
                element.childNodes[0].nodeType === Node.TEXT_NODE && 
                element.textContent.trim().length > 0 &&
                !element.classList.contains('rotified-text')) {  // Double-check class
                
                try {
                    console.log('Attempting to transform:', element.textContent);
                    const response = await chrome.runtime.sendMessage({
                        action: 'transformText',
                        text: element.textContent
                    });
                    
                    if (response && response.transformedText) {
                        element.textContent = response.transformedText;
                        element.style.fontFamily = "'Comic Sans MS', cursive";
                        element.classList.add('rotified-text');  // Add class instead of data attribute
                        console.log('Text transformed successfully');
                    } else {
                        console.warn('No transformed text in response:', response);
                    }
                } catch (error) {
                    console.error('Text transformation failed:', error);
                }
            }
        }
    },

    // Initialize
    init: () => {
        console.log('Initializing Rotify...');
        const processPage = rotifyApp.debounce(() => {
            rotifyApp.replaceMedia();
            rotifyApp.processText();
        }, 1000);

        // Watch for new content
        new MutationObserver(processPage).observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial processing
        processPage();
    }
};

// Make rotifyApp available globally
window.rotifyApp = rotifyApp;

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rotifyApp.init);
} else {
    rotifyApp.init();
}