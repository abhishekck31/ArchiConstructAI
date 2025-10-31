import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { toBase64 } from '../utils/fileUtils';
import { AspectRatio, GenerationMode } from '../types';

interface InputBarProps {
    onSendMessage: (
        text: string, 
        image: { src: string, mimeType: string } | null,
        generationConfig: { mode: GenerationMode, aspectRatio: AspectRatio }
    ) => void;
    isLoading: boolean;
    contextImage: { src: string, mimeType: string } | null;
    onClearContextImage: () => void;
}

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.55a.75.75 0 0 1 1.06 1.061l-3.45 3.55a1.125 1.125 0 0 0 1.59 1.591l3.456-3.554a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
);


const InputBar = forwardRef<HTMLInputElement, InputBarProps>(({ onSendMessage, isLoading, contextImage, onClearContextImage }, ref) => {
    const [text, setText] = useState('');
    const [selectedImage, setSelectedImage] = useState<{ src: string, mimeType: string, name: string, file: File } | null>(null);
    const [generationMode, setGenerationMode] = useState<GenerationMode>('video');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!contextImage;

    // Effect to handle context image changes
    useEffect(() => {
        if (isEditing) {
            setGenerationMode('image');
            setSelectedImage(null); // Clear any user-uploaded file
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [isEditing]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onClearContextImage(); // Clear any context image if a new file is uploaded
            const base64 = await toBase64(file);
            setSelectedImage({ src: base64, mimeType: file.type, name: file.name, file: file });
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const imagePayload = contextImage 
            ? { src: contextImage.src, mimeType: contextImage.mimeType }
            : selectedImage 
            ? { src: selectedImage.src, mimeType: selectedImage.mimeType } 
            : null;

        if ((text.trim() || imagePayload) && !isLoading) {
            onSendMessage(
                text, 
                imagePayload, 
                { mode: isEditing ? 'image' : generationMode, aspectRatio }
            );
            setText('');
            handleRemoveImage();
            onClearContextImage();
        }
    };
    
    let displayImage: { previewSrc: string; name: string } | null = null;
    if (contextImage) {
        displayImage = {
            previewSrc: `data:${contextImage.mimeType};base64,${contextImage.src}`,
            name: 'Refining image...'
        };
    } else if (selectedImage) {
        displayImage = {
            previewSrc: URL.createObjectURL(selectedImage.file),
            name: selectedImage.name
        };
    }

    return (
        <div className="p-3 border-t border-gray-200 bg-white">
            {displayImage && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                        <img src={displayImage.previewSrc} alt="Preview" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        <span className="text-xs text-gray-700 font-medium truncate">{displayImage.name}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                         {!isEditing && (
                            <div className="flex items-center bg-gray-200 p-0.5 rounded-md">
                                <button onClick={() => setGenerationMode('video')} className={`px-2 py-0.5 text-xs rounded-md ${generationMode === 'video' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>Video</button>
                                <button onClick={() => setGenerationMode('image')} className={`px-2 py-0.5 text-xs rounded-md ${generationMode === 'image' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>Image</button>
                            </div>
                         )}
                        
                        {generationMode === 'video' && !isEditing && (
                            <div className="flex items-center bg-gray-200 p-0.5 rounded-md">
                                <button onClick={() => setAspectRatio('16:9')} className={`px-2 py-0.5 text-xs rounded-md ${aspectRatio === '16:9' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>16:9</button>
                                <button onClick={() => setAspectRatio('9:16')} className={`px-2 py-0.5 text-xs rounded-md ${aspectRatio === '9:16' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>9:16</button>
                            </div>
                        )}

                        <button onClick={isEditing ? onClearContextImage : handleRemoveImage} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700" aria-label="Remove image">
                           <CloseIcon />
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-shrink-0 p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Attach image"
                >
                   <UploadIcon />
                </button>
                <input
                    ref={ref}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={displayImage ? `Describe changes or ask a question...` : "Type your message..."}
                    disabled={isLoading}
                    className="flex-1 w-full p-2.5 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 disabled:opacity-50 transition-shadow"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    disabled={isLoading || (!text.trim() && !displayImage)}
                    className="flex-shrink-0 p-2.5 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                   <SendIcon />
                </button>
            </form>
        </div>
    );
});

InputBar.displayName = 'InputBar';

export default InputBar;