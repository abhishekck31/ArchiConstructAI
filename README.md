# ArchiConstruct AI Chatbot Integration Guide

You have successfully built a powerful AI chatbot for your client! This guide will walk you through the final steps to deploy the chatbot and integrate it as a professional chat widget on your client's live website.

**This version uses a secure backend proxy to protect your API key.**

## Step 1: Deploy Your Chatbot Application

Before you can embed the chatbot, it needs to be live on the internet with its own URL. Hosting services like Vercel or Netlify are perfect because they support the serverless function proxy we've just implemented.

1.  **Sign up for Vercel or Netlify:** If you don't have an account, create one. They have generous free tiers.
2.  **Connect Your Code Repository:** Connect your GitHub, GitLab, or Bitbucket account where your chatbot code is stored.
3.  **Import Your Project:** Select the repository for your chatbot project.
4.  **Configure and Deploy:**
    *   The service will likely auto-detect that it's a React project. The default build settings should work correctly. The `api/proxy.ts` file will be automatically detected and deployed as a serverless function.
    *   **CRUCIALLY, you must add your `API_KEY` as a server-side environment variable.** This is secure and will not be exposed to browsers. In the project settings on Vercel/Netlify, find the "Environment Variables" section and add a new variable:
        *   **Name:** `API_KEY`
        *   **Value:** `[Your Google AI API Key]`
    *   Click "Deploy". The service will build your website and deploy the serverless function.
5.  **Get Your URL:** Once deployed, you will be given a public URL (e.g., `https://archiconstruct-ai.vercel.app`). **Copy this URL.**

## Step 2: Configure the Widget Loader

Now, you need to tell the widget where to find your live chatbot.

1.  Open the `public/widget-loader.js` file in your project.
2.  Find the following line at the top of the file:
    ```javascript
    const CHATBOT_URL = 'YOUR_DEPLOYED_CHATBOT_URL_HERE'; 
    ```
3.  Replace `YOUR_DEPLOYED_CHATBOT_URL_HERE` with the URL you copied from Step 1.
    
    **Example:**
    ```javascript
    const CHATBOT_URL = 'https://archiconstruct-ai.vercel.app'; 
    ```
4.  Save the `widget-loader.js` file.

## Step 3: Add the Widget to Your Client's Website

This is the final and simplest step. You only need to add one line of code to your client's website HTML.

1.  Get access to the HTML code of your client's website.
2.  Find the closing `</body>` tag at the bottom of their HTML file(s).
3.  **Just before the `</body>` tag**, paste the following script tag. You will need to host the `widget-loader.js` file somewhere accessible. You can even place it in the same directory as your client's website files.

    ```html
    <!-- Add this line just before the closing </body> tag -->
    <script defer src="https://[path-to-your-widget]/widget-loader.js"></script>
    ```
    
    Replace `https://[path-to-your-widget]/` with the actual path where you've placed the `widget-loader.js` file.

**That's it!** Once the script tag is added, the chat widget will automatically appear on your client's website, running securely with your API key protected.
