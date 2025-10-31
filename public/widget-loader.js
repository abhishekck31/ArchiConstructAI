
(function() {
    // =================================================================================================
    // TODO: PASTE YOUR DEPLOYED CHATBOT URL HERE
    // Example: const CHATBOT_URL = 'https://my-awesome-chatbot.vercel.app';
    // =================================================================================================
    const CHATBOT_URL = 'YOUR_DEPLOYED_CHATBOT_URL_HERE'; 
    // =================================================================================================

    if (!CHATBOT_URL || CHATBOT_URL === 'YOUR_DEPLOYED_CHATBOT_URL_HERE') {
        console.warn('Chatbot widget not loaded: Please set your CHATBOT_URL in widget-loader.js');
        return;
    }

    // Create a container for all widget elements
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'archiconstruct-ai-widget-container';
    document.body.appendChild(widgetContainer);

    // Inject CSS for the widget
    const style = document.createElement('style');
    style.innerHTML = `
        #archiconstruct-ai-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }

        .chat-bubble {
            width: 60px;
            height: 60px;
            background-color: #2563eb; /* blue-600 */
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .chat-bubble:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .chat-bubble svg {
            width: 32px;
            height: 32px;
            color: white;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .chat-iframe-container {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 400px;
            height: 600px;
            max-width: 90vw;
            max-height: 70vh;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.3s ease, opacity 0.3s ease;
            transform-origin: bottom right;
        }
        
        .chat-iframe-container.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        .chat-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
            #archiconstruct-ai-widget-container {
                bottom: 15px;
                right: 15px;
            }
            .chat-iframe-container {
                width: calc(100vw - 30px);
                height: 75vh;
                bottom: 80px;
            }
        }
    `;
    widgetContainer.appendChild(style);

    // Create the chat bubble button
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `
        <svg id="chat-icon-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.15l-2.11 2.533a1.71 1.71 0 0 1-2.72 0l-2.11-2.533a.39.39 0 0 0-.297-.15 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.74c0-1.946 1.37-3.68 3.348-3.97Z" clip-rule="evenodd" />
        </svg>
        <svg id="chat-icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="display: none; transform: scale(0);">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
    `;

    // Create the iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'chat-iframe-container';
    
    // Create the iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'chat-iframe';
    iframe.src = CHATBOT_URL;
    iframe.title = 'ArchiConstruct AI Chatbot';
    iframeContainer.appendChild(iframe);
    
    // Append elements to the main container
    widgetContainer.appendChild(iframeContainer);
    widgetContainer.appendChild(bubble);

    // Add event listener to the bubble
    const openIcon = document.getElementById('chat-icon-open');
    const closeIcon = document.getElementById('chat-icon-close');

    bubble.addEventListener('click', () => {
        iframeContainer.classList.toggle('open');
        const isOpen = iframeContainer.classList.contains('open');
        openIcon.style.opacity = isOpen ? '0' : '1';
        openIcon.style.transform = isOpen ? 'rotate(-90deg) scale(0)' : 'rotate(0) scale(1)';
        closeIcon.style.display = 'block';
        closeIcon.style.opacity = isOpen ? '1' : '0';
        closeIcon.style.transform = isOpen ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0)';
    });
})();
