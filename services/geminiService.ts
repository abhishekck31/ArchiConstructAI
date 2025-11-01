// FIX: Import `GenerateVideosResult` as `Operation` is a generic type.
import { Operation, GenerateVideosResult } from '@google/genai';
import { AspectRatio, Message } from '../types';

// This is a generic type for the response from our backend proxy
interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// A helper function to handle fetch requests to our own backend proxy
const fetchFromProxy = async (endpoint: string, body: object): Promise<ProxyResponse> => {
    const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
};


export const generateTextOrImageResponse = async (
    messages: Message[],
    generateImage: boolean
): Promise<any> => { // The response will be the JSON from Gemini, passed through our proxy
    const response = await fetchFromProxy('proxy', {
        action: 'generateTextOrImage',
        messages,
        generateImage,
    });

    if (!response.success) {
        throw new Error(response.error || 'Failed to generate response from proxy.');
    }
    return response.data;
};

// FIX: Update `Operation` to `Operation<GenerateVideosResult>` as `Operation` is a generic type.
export const generateVideo = async (
    prompt: string,
    image: { src: string; mimeType: string } | null,
    aspectRatio: AspectRatio
): Promise<Operation<GenerateVideosResult>> => {
    const response = await fetchFromProxy('proxy', {
        action: 'generateVideo',
        prompt,
        image,
        aspectRatio,
    });
    if (!response.success) {
        throw new Error(response.error || 'Failed to start video generation from proxy.');
    }
    return response.data as Operation<GenerateVideosResult>;
};

// FIX: Update `Operation` to `Operation<GenerateVideosResult>` as `Operation` is a generic type.
export const checkVideoStatus = async (operation: Operation<GenerateVideosResult>): Promise<Operation<GenerateVideosResult>> => {
     const response = await fetchFromProxy('proxy', {
        action: 'checkVideoStatus',
        operation,
    });
    if (!response.success) {
        throw new Error(response.error || 'Failed to check video status from proxy.');
    }
    return response.data as Operation<GenerateVideosResult>;
};
