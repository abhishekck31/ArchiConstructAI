import { GoogleGenAI, Content, Part, Modality } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';
import { Message } from '../types';

// This function will be deployed as a serverless function.
// It reads the API_KEY from the server's environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to build the 'contents' array for the Gemini API for chat history
const buildContents = (messages: Message[]): Content[] => {
    return messages.map((msg) => {
        const parts: Part[] = [];
        if (msg.image) {
            parts.push({
                inlineData: {
                    data: msg.image.src,
                    mimeType: msg.image.mimeType,
                },
            });
        }
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        return {
            role: msg.role,
            parts: parts,
        };
    }).filter(c => c.parts.length > 0);
};

// The main handler for all incoming requests to our proxy.
export default async function handler(req: Request) {
    // Handle video fetching separately as it's a GET request
    const url = new URL(req.url);
    const videoUri = url.searchParams.get('videoUri');
    if (req.method === 'GET' && videoUri) {
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY is not configured on the server.");
            }
            const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            return new Response(videoBlob, {
                status: 200,
                headers: { 'Content-Type': 'video/mp4' }
            });
        } catch (error) {
            console.error('Video fetch error:', error);
            return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 500 });
        }
    }


    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is not configured on the server.");
        }
        
        const body = await req.json();
        const { action } = body;

        let data;

        switch (action) {
            case 'generateTextOrImage':
                const { messages, generateImage } = body;
                
                let requestContents: Content | Content[];
                const modelName = generateImage ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash';
                const systemInstruction = generateImage ? undefined : SYSTEM_PROMPT;

                if (generateImage) {
                    // For image generation/editing, the model expects a single prompt (Content), not a chat history (Content[]).
                    const lastMessage = messages[messages.length - 1];
                    const parts: Part[] = [];
                     // For editing, the model generally expects the image part before the text part.
                    if (lastMessage.image) {
                        parts.push({
                            inlineData: {
                                data: lastMessage.image.src,
                                mimeType: lastMessage.image.mimeType,
                            },
                        });
                    }
                    if (lastMessage.text) {
                        parts.push({ text: lastMessage.text });
                    }
                    // Pass a single Content object for single-turn image models.
                    requestContents = { parts };
                } else {
                    // For a normal chat, we send the whole history.
                    requestContents = buildContents(messages);
                }
                
                const genContentResponse = await ai.models.generateContent({
                    model: modelName,
                    contents: requestContents,
                    config: {
                        ...(systemInstruction && { systemInstruction }),
                        ...(generateImage && { responseModalities: [Modality.IMAGE] }),
                    }
                });
                data = genContentResponse;
                break;

            case 'generateVideo':
                const { prompt, image, aspectRatio } = body;
                 data = await ai.models.generateVideos({
                    model: 'veo-3.1-fast-generate-preview',
                    prompt: prompt,
                    ...(image && { image: { imageBytes: image.src, mimeType: image.mimeType } }),
                    config: {
                        numberOfVideos: 1,
                        resolution: '720p',
                        aspectRatio: aspectRatio,
                    }
                });
                break;
            
            case 'checkVideoStatus':
                const { operation } = body;
                data = await ai.operations.getVideosOperation({ operation });
                break;
            
            default:
                throw new Error('Invalid action');
        }

        return new Response(JSON.stringify({ success: true, data }), { status: 200 });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 500 });
    }
}
