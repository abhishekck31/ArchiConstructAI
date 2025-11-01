import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
// FIX: Import `GenerateVideosResult` as `Operation` is a generic type.
import { Operation, GenerateContentResponse, GenerateVideosResult } from '@google/genai';
import Header from './Header';
import MessageList from './MessageList';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';
import { WELCOME_MESSAGE_TEXT } from '../constants';
import { Message, GenerationMode, AspectRatio } from '../types';
import { generateTextOrImageResponse, generateVideo, checkVideoStatus } from '../services/geminiService';

const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'model',
            text: WELCOME_MESSAGE_TEXT,
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [contextImage, setContextImage] = useState<{ src: string, mimeType: string } | null>(null);
    
    const messageListRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messageListRef.current?.scrollTo({
            top: messageListRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isLoading]);
    
    useEffect(() => {
        // Simple check on load. If the welcome message fails to appear, it could be a sign of a larger issue.
        // The real error handling is now within the API calls.
        if (messages.length === 0) {
             setMessages([{ id: uuidv4(), role: 'model', text: "Could not initialize chat session. The API key might be missing on the server." }]);
        }
    }, [messages.length]);


    const processVideoGeneration = useCallback(async (
        prompt: string,
        image: { src: string, mimeType: string } | null,
        aspectRatio: AspectRatio
    ) => {
        const modelMessageId = uuidv4();
        try {
            setMessages(prev => [...prev, {
                id: modelMessageId,
                role: 'model',
                text: '',
                isLoadingVideo: true,
            }]);

            // FIX: The `Operation` type is generic and requires `GenerateVideosResult` as a type argument for video operations.
            let operation: Operation<GenerateVideosResult> = await generateVideo(prompt, image, aspectRatio);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await checkVideoStatus(operation);
            }

            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (videoUri) {
                // The proxy will fetch the video for us, keeping the API key secure.
                const videoResponse = await fetch(`/api/proxy?videoUri=${encodeURIComponent(videoUri)}`);
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                
                setMessages(prev => prev.map(msg => msg.id === modelMessageId 
                    ? { ...msg, isLoadingVideo: false, video: videoUrl, text: 'Here is your generated video:' }
                    : msg
                ));
            } else {
                throw new Error('Video generation failed. No video URI returned.');
            }

        } catch (error) {
            console.error('Video generation error:', error);
            const errorMessageContent = "Sorry, I couldn't generate the video. There might be an issue with the server configuration. Please try again later.";

            setMessages(prev => prev.map(msg => msg.id === modelMessageId 
                ? { ...msg, isLoadingVideo: false, text: errorMessageContent }
                : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSendMessage = useCallback(async (
        text: string,
        image: { src: string, mimeType: string } | null,
        generationConfig: { mode: GenerationMode, aspectRatio: AspectRatio }
    ) => {
        if (isLoading) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            text,
            ...(image && { image }),
        };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        setContextImage(null);

        if (generationConfig.mode === 'video') {
            processVideoGeneration(text, image, generationConfig.aspectRatio);
            return;
        }

        const modelMessageId = uuidv4();
        try {
            if (generationConfig.mode === 'image') {
                setMessages(prev => [...prev, {
                    id: modelMessageId, role: 'model', text: '', isLoadingImage: true,
                }]);
            }

            const response: GenerateContentResponse = await generateTextOrImageResponse(
                updatedMessages,
                generationConfig.mode === 'image'
            );

            const modelResponseText = response.text;
            let modelResponseImage: { src: string, mimeType: string } | undefined;

            if (generationConfig.mode === 'image') {
                const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (imagePart?.inlineData) {
                    modelResponseImage = {
                        src: imagePart.inlineData.data,
                        mimeType: imagePart.inlineData.mimeType,
                    };
                }
            }
            
            const modelMessage: Message = {
                id: modelMessageId, role: 'model', text: modelResponseText,
                ...(modelResponseImage && { image: modelResponseImage }),
                isLoadingImage: false
            };

            if (generationConfig.mode === 'image') {
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? modelMessage : msg));
            } else {
                 setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error) {
            console.error('API call error:', error);
            const errorText = "Sorry, I encountered an error. The server might be configured incorrectly. Please try again later.";
            if (generationConfig.mode === 'image') {
                setMessages(prev => prev.map(msg => msg.id === modelMessageId ? { ...msg, text: errorText, isLoadingImage: false } : msg));
            } else {
                setMessages(prev => [...prev, { id: uuidv4(), role: 'model', text: errorText }]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, processVideoGeneration]);

    const handleEditImage = (imageToEdit: { src: string, mimeType: string }) => {
        setContextImage(imageToEdit);
        inputRef.current?.focus();
    };

    const handleClearContextImage = () => {
        setContextImage(null);
    };

    const isMediaLoading = messages.some(msg => msg.isLoadingImage || msg.isLoadingVideo);

    return (
        <div className="flex flex-col h-full bg-white shadow-2xl rounded-lg overflow-hidden relative">
            <Header />
            <MessageList
                ref={messageListRef}
                messages={messages}
                onEditImage={handleEditImage}
            />
            {isLoading && !isMediaLoading && <TypingIndicator />}
            <InputBar
                ref={inputRef}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                contextImage={contextImage}
                onClearContextImage={handleClearContextImage}
            />
        </div>
    );
};

export default ChatWindow;
