import React from 'react';

interface ApiKeyPromptProps {
    onSelectKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M14.615 1.585a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V4.385L12.7 5.54a.75.75 0 0 1-1.01-.07l-3.25-3.5a.75.75 0 0 1 .98-1.13l3.25 3.5 1.435-1.156a.75.75 0 0 1 .99.112ZM7.585 6.385a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75ZM2.25 12a.75.75 0 0 1 .75-.75h18a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75ZM3 15.75a.75.75 0 0 0 0 1.5h18a.75.75 0 0 0 0-1.5H3Zm.75 2.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Enable AI Generation</h1>
                <p className="text-gray-600 mb-6">
                    To use the AI video and image generation features, you need to select a Google AI API key.
                    Please note that these are billable services.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-6">
                    For more details, please see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-600">official billing documentation</a>.
                </div>
                <button
                    onClick={onSelectKey}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Select API Key
                </button>
            </div>
        </div>
    );
};

export default ApiKeyPrompt;