# Rotify
### The one click solution to skibidi your current tab!

## VOTING IS LIVE! 
[VOTE HERE](https://devpost.com/software/rotify)

## Features  
- **Text Transformation**: Converts text content into entertaining transformations using `chrome.runtime.sendMessage`.  
- **Meme Replacement**: Replaces images and backgrounds with a collection of curated memes.  
- **Font Styling**: Applies a playful Comic Sans MS font to transformed text for an extra touch of rot.  
- **Dynamic Content Handling**: Monitors and updates dynamically loaded content with Mutation Observers.  

## Installation  

1. Clone the repository or download it as a ZIP file.  
   ```bash
   git clone git@github.com:Warfarian/Rotify.git

2. Open your browser and go to the extensions page:
- **Chrome:** chrome://extensions
- **Edge:** edge://extensions

3. Enable **Developer Mode**.

4. Click **Load Unpacked** and select the project folder.

5. The **Rotify** extension will be installed and ready to use!

## Usage
- Enable the extension in your browser.
- Browse any website and watch the magic happen:
  -   Text content gets transformed into fun, modern meme-style language.
  -   Images are swapped with hilarious memes.
- Dynamically loaded content will also get transformed automatically.
- Create a config.js file and update it with a valid Google API key for the Gemini API:
  ```bash
  window.config = {
      GOOGLE_API_KEY: 'your-api-key-here'
  };
  ```

## Development
### Prerequisites
- A modern browser (Chrome or Edge) with Developer Mode enabled.

## File Structure
- manifest.json: Describes the extension's metadata and permissions.
- background.js: Handles API requests and background processes.
- content.js: Injected into web pages, performs transformations.
- config.js: Contains configuration, including the API key.
- images/: A folder with all the memes used for replacements.


```bash Rotify/
├── manifest.json        # Extension metadata and permissions
├── background.js        # Background script to handle API requests and transformations
├── content.js           # Script injected into web pages for text and image modification
├── config.js            # Configuration file containing the Google API key
├── index.html           # Optional popup or UI for the extension
├── images/              # Folder containing memes for image replacement
│   ├── .gif/jpg/png files
```

## Acknowledgments
- Memes sourced from various free resources for entertainment purposes.
- Inspired by brainrot
- A submission for the brainrot hackathon! [https://brainrot-jia-seed-hackathon.devpost.com/]
