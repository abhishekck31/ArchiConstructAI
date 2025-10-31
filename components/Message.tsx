import React from 'react';
import { Message as MessageType } from '../types';

const ModelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-11ZM5 6.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H5ZM5 9.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H5Zm3.5.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75ZM5 12.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H5Z" />
    </svg>
);

const LoadingIndicator: React.FC<{text: string}> = ({ text }) => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <span className="text-sm text-gray-600">{text}</span>
    </div>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
);


interface MessageProps {
    message: MessageType;
    onEditImage: (image: { src: string, mimeType: string }) => void;
}

const Message: React.FC<MessageProps> = ({ message, onEditImage }) => {
    const isModel = message.role === 'model';
    
    if (isModel) {
        return (
            <div className="flex items-end gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <ModelIcon />
                </div>
                <div className="px-3.5 py-2.5 bg-gray-100 text-gray-800 rounded-r-2xl rounded-bl-2xl max-w-[85%] sm:max-w-[70%] break-words">
                    {message.isLoadingVideo && <LoadingIndicator text="Generating video..." />}
                    {message.isLoadingImage && <LoadingIndicator text="Generating image..." />}
                    
                    {!message.isLoadingVideo && !message.isLoadingImage && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    )}

                    {message.image && (
                         <div className="mt-2 space-y-2">
                            <img
                                src={`data:${message.image.mimeType};base64,${message.image.src}`}
                                alt="Generated content"
                                className="rounded-lg max-h-64 w-full object-cover"
                            />
                            {!message.isLoadingImage && (
                                <button
                                    onClick={() => onEditImage(message.image!)}
                                    className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center gap-1.5 transition-colors"
                                    aria-label="Refine this image"
                                >
                                    <EditIcon />
                                    Refine
                                </button>
                            )}
                         </div>
                    )}

                    {message.video && (
                         <video
                            src={message.video}
                            controls
                            className="mt-2 rounded-lg w-full"
                            aria-label="Generated video"
                        />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-end justify-end">
            <div className="px-3.5 py-2.5 bg-blue-600 text-white rounded-l-2xl rounded-br-2xl max-w-[85%] sm:max-w-[70%] break-words">
                {message.image && (
                     <img
                        src={`data:${message.image.mimeType};base64,${message.image.src}`}
                        alt="User upload"
                        className="mb-2 rounded-lg max-h-48 w-full object-cover"
                    />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};

export default Message;