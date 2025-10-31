import React, { forwardRef } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

interface MessageListProps {
    messages: MessageType[];
    onEditImage: (image: { src: string, mimeType: string }) => void;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({ messages, onEditImage }, ref) => {
    return (
        <div ref={ref} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
                <Message key={msg.id} message={msg} onEditImage={onEditImage} />
            ))}
        </div>
    );
});

MessageList.displayName = 'MessageList';

export default MessageList;