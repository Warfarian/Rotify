import { GOOGLE_API_KEY } from './config.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'transformText') {
        console.log('Background received request:', request);
        
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "contents": [{
                "role": "user",
                "parts": [{
                    "text": `Take this text and rewrite it with maximum internet meme energy, using words like sigma, skibidi, rizz, gyatt, kai cenat, baby gronk, do not return anything in bold as it results in ** being displayed: ${request.text}`
                }]
            }],
            "generationConfig": {
                "temperature": 0.9,
                "maxOutputTokens": 1000
            }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw
        };

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`, requestOptions)
            .then(async response => {
                const data = await response.json();
                console.log('Complete response structure:', JSON.stringify(data, null, 2));
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    sendResponse({
                        transformedText: data.candidates[0].content.parts[0].text
                    });
                } else {
                    console.error('Detailed response structure:', {
                        rawData: JSON.stringify(data, null, 2)
                    });
                    sendResponse({
                        error: 'Could not find transformed text in response',
                        debug: data
                    });
                }
            })
            .catch(error => {
                console.error('API Error:', error);
                sendResponse({
                    error: error.message
                });
            });

        return true;
    }
});