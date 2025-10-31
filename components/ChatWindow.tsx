import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat } from '@google/genai';
import { Message, AspectRatio, GenerationMode } from '../types';
import { WELCOME_MESSAGE_TEXT } from '../constants';
import { createChatSession, generateVideoFromImage, generateImageFromImage } from '../services/geminiService';
import Header from './Header';
import MessageList from './MessageList';
import InputBar from './InputBar';

const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'model',
            text: WELCOME_MESSAGE_TEXT,
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contextImage, setContextImage] = useState<{ src: string, mimeType: string } | null>(null);

    const chatSessionRef = useRef<Chat | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            chatSessionRef.current = createChatSession();
        } catch (e) {
            console.error(e);
            setError("Could not initialize chat session. The API key might be missing.");
        }
    }, []);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSetContextImage = (image: { src: string, mimeType: string }) => {
        setContextImage(image);
        inputRef.current?.focus();
    };

    const handleClearContextImage = () => {
        setContextImage(null);
    };

    const handleSendMessage = useCallback(async (
        inputText: string, 
        image: { src: string; mimeType: string } | null, 
        generationConfig: { mode: GenerationMode, aspectRatio: AspectRatio }
    ) => {
        if ((!inputText.trim() && !image) || isLoading) return;
        
        const newUserMessage: Message = {
            id: uuidv4(),
            role: 'user',
            text: inputText,
            image,
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);
        setContextImage(null); // Clear context image once it's part of a message

        if (image) {
            if (generationConfig.mode === 'video') {
                const modelPlaceholderMessage: Message = {
                    id: uuidv4(),
                    role: 'model',
                    text: "Generating a video based on your image and prompt. This may take a few moments...",
                    isLoadingVideo: true,
                };
                setMessages(prev => [...prev, modelPlaceholderMessage]);
                
                try {
                    const videoUrl = await generateVideoFromImage(inputText, image, generationConfig.aspectRatio);
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelPlaceholderMessage.id 
                        ? { ...msg, text: "Here is your generated video! ✨", video: videoUrl, isLoadingVideo: false }
                        : msg
                    ));
                } catch (err: any) {
                    const errorMessage = err.message === 'API_KEY_INVALID' 
                        ? "Video generation failed: The API Key is invalid or missing. Please contact the site administrator."
                        : `Video generation failed: ${err.message}`;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelPlaceholderMessage.id 
                        ? { ...msg, text: errorMessage, isLoadingVideo: false }
                        : msg
                    ));
                }
            } else { // Image generation
                const modelPlaceholderMessage: Message = {
                    id: uuidv4(),
                    role: 'model',
                    text: "Generating an image based on your prompt...",
                    isLoadingImage: true,
                };
                setMessages(prev => [...prev, modelPlaceholderMessage]);

                try {
                    const generatedImage = await generateImageFromImage(inputText, image);
                     setMessages(prev => prev.map(msg => 
                        msg.id === modelPlaceholderMessage.id 
                        ? { ...msg, text: "Here is your generated image! 🎨 You can ask for more changes.", image: generatedImage, isLoadingImage: false }
                        : msg
                    ));
                } catch (err: any) {
                     const errorMessage = err.message === 'API_KEY_INVALID' 
                        ? "Image generation failed: The API Key is invalid or missing. Please contact the site administrator."
                        : `Image generation failed: ${err.message}`;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelPlaceholderMessage.id 
                        ? { ...msg, text: errorMessage, isLoadingImage: false }
                        : msg
                    ));
                }
            }
            setIsLoading(false);
        } else { // Standard text chat
            try {
                if (!chatSessionRef.current) {
                    throw new Error("Chat session not initialized. The API key might be missing from the environment configuration.");
                }
                const response = await chatSessionRef.current.sendMessage({ message: inputText });
                
                const modelResponse: Message = {
                    id: uuidv4(),
                    role: 'model',
                    text: response.text,
                };
                setMessages(prev => [...prev, modelResponse]);

            } catch (err: any) {
                console.error("Error sending message:", err);
                 const errorMessageText = (err as Error).message.includes("API key") 
                    ? "I'm sorry, there's a configuration issue with the API key. Please contact the site administrator."
                    : "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.";

                const errorMessage: Message = {
                    id: uuidv4(),
                    role: 'model',
                    text: errorMessageText,
                };
                setMessages(prev => [...prev, errorMessage]);
                setError("Failed to get a response from the AI.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [isLoading]);

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-none sm:rounded-xl overflow-hidden">
            <Header />
            <MessageList 
                messages={messages} 
                ref={messageListRef} 
                onEditImage={handleSetContextImage} 
            />
            {error && <div className="text-red-500 text-center text-sm p-2">{error}</div>}
            <InputBar 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading}
                contextImage={contextImage}
                onClearContextImage={handleClearContextImage}
                ref={inputRef}
            />
        </div>
    );
};

export default ChatWindow;