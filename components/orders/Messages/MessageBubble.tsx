import React from 'react';

interface MessageBubbleProps {
    senderAddress: string;
    content: string;
    timestamp: string;
    status: string;
    isSentByLoggedInUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ senderAddress, content, timestamp, status, isSentByLoggedInUser }) => {
    const formatDate = (timestamp: string) => new Date(timestamp).toLocaleString();

    return (
        <div className={`message-container  d-flex flex-column ${isSentByLoggedInUser ? 'sent' : 'received'}`}>
            <span className='disclaimer'> {formatDate(timestamp)}</span>

            <div className="message-bubble">
                <strong>From:</strong> {isSentByLoggedInUser ? 'You' : 'Smart Dropper'}<br />
                <strong>Message:</strong> {content}<br />
                <strong>Status:</strong> {status}
            </div>
        </div>
    );
};

export default MessageBubble;
