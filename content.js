const rotifyApp = {
    // Simple debounce function
    debounce: (func, wait) => {
        let timeout;
        return function (...args) {
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
            "images/donpollo.png",
            "images/oiia-oiiaoiiaTransparent.gif",
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
            '[style*="framerusercontent"]:not([data-rotified])',
        ];

        imageSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (element.tagName.toLowerCase() === "img") {
                    const newImage = getRandomImage();
                    element.src = newImage;
                    element.srcset = "";
                    element.sizes = "";
                } else {
                    element.style.backgroundImage = `url('${getRandomImage()}')`;
                }
                element.setAttribute("data-rotified", "true");
            });
        });
    },  
    // Add this right before the processText method
    testMessaging: () => {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(
                    { action: "TEST_MESSAGE" },
                    (response) => {
                        console.log("TEST MESSAGE RESPONSE:", response);
                        if (chrome.runtime.lastError) {
                            console.error("Messaging test failed:", chrome.runtime.lastError);
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    }
                );
            } catch (error) {
                console.error("Error sending test message:", error);
                reject(error);
            }
            });
        },  
    processText: async () => {
        const GOOGLE_API_KEY = window.config?.GOOGLE_API_KEY;
        
        const transformText = async (text) => {
            if (!GOOGLE_API_KEY) {
                throw new Error("No API key configured");
            }

            const raw = JSON.stringify({
                "contents": [{
                    "role": "user",
                    "parts": [{
                        "text": `Transform this text into modern internet/meme speak. Use words like:
                        - sigma, skibidi, rizz, gyatt, kai cenat, baby gronk
                        - fr fr, no cap, bussin, based, W rizz
                        - sheesh, ong, npc behavior
                        
                        RULES:
                        1. DO NOT use asterisks (*) or any markdown
                        2. DO NOT say "provide the text" or ask for text
                        3. Just transform the given text directly
                        4. Keep the same general meaning
                        
                        Text to transform: ${text}`
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.9,
                    "maxOutputTokens": 1000
                }
            });

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: raw,
                }
            );

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || "API Error");
            }

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
            
            throw new Error("No transformed text found");
        };

        const textElements = document.querySelectorAll(
            "p:not(.rotified-text), h1:not(.rotified-text), h2:not(.rotified-text), h3:not(.rotified-text), h4:not(.rotified-text), h5:not(.rotified-text), h6:not(.rotified-text), span:not(.rotified-text), div:not(.rotified-text), a:not(.rotified-text), li:not(.rotified-text), td:not(.rotified-text), th:not(.rotified-text), label:not(.rotified-text), button:not(.rotified-text)"
        );

        for (const element of textElements) {
            if (
                element.childNodes.length === 1 &&
                element.childNodes[0].nodeType === Node.TEXT_NODE &&
                element.textContent.trim().length > 0 &&
                !element.classList.contains("rotified-text")
            ) {
                try {
                    const transformedText = await transformText(element.textContent);
                    element.textContent = transformedText;
                    element.style.fontFamily = "'Comic Sans MS', cursive";
                    element.classList.add("rotified-text");
                } catch (error) {
                    console.error("Text transformation failed:", error);
                }
            }
        }
    },

    // Initialize
    init: () => {
        console.log("Initializing Rotify...");
        const processPage = rotifyApp.debounce(() => {
            rotifyApp.replaceMedia();
            rotifyApp.processText();
        }, 1000);

        // Watch for new content
        new MutationObserver(processPage).observe(document.body, {
            childList: true,
            subtree: true,
        });

        processPage();
    },
};

// Config loading
const loadConfig = () => {
    return new Promise((resolve, reject) => {
        if (window.config) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("config.js");
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load config script"));
        (document.head || document.documentElement).appendChild(script);
    });
};

// Initialize when ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rotifyApp.init);
} else {
    rotifyApp.init();
}