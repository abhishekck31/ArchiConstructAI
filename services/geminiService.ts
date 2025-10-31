import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { AspectRatio } from "../types";

const getGenAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    // Create a new instance for each call to ensure the latest API key is used.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export function createChatSession(): Chat {
    const ai = getGenAI();
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_PROMPT,
        },
    });
    return chat;
}

export async function generateImageFromImage(
    prompt: string,
    image: { src: string; mimeType: string }
): Promise<{ src: string, mimeType: string }> {
     const ai = getGenAI();
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: image.src,
                            mimeType: image.mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                return {
                    src: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        throw new Error("Image generation failed: No image data found in response.");

     } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
             throw new Error("API_KEY_INVALID");
        }
        throw new Error("Failed to generate image. The prompt may have been blocked. Please try again with a different prompt or image.");
     }
}


export async function generateVideoFromImage(
    prompt: string,
    image: { src: string; mimeType: string },
    aspectRatio: AspectRatio
): Promise<string> {
    const ai = getGenAI();

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: image.src,
                mimeType: image.mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p', // Using 720p for faster generation
                aspectRatio: aspectRatio,
            },
        });

        // Poll for the result
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation failed: No download link found.");
        }

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
             throw new Error("API_KEY_INVALID");
        }
        throw new Error("Failed to generate video. The prompt may have been blocked. Please try again with a different prompt or image.");
    }
}