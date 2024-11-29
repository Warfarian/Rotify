// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'transformText') {
        fetch("https://api.unify.ai/v0/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${window.config.UNIFY_API_KEY}`
            },
            body: JSON.stringify(request.data)
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

        document.querySelectorAll('img:not([data-rotified])').forEach(img => {
            img.src = getRandomImage();
            img.setAttribute('data-rotified', 'true');
        });
    },

    // Process page text
    processText: async () => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, span:not([data-rotified])');
        
        for (const element of textElements) {
            if (element.textContent.trim().length > 10) {
                try {
                    console.log('Attempting to transform:', element.textContent);
                    const response = await chrome.runtime.sendMessage({
                        action: 'transformText',
                        text: element.textContent
                    });
                    
                    console.log('API Response:', response);
                    
                    if (response && response.transformedText) {
                        element.textContent = response.transformedText;
                        element.style.fontFamily = "'Comic Sans MS', cursive";
                        element.setAttribute('data-rotified', 'true');
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
