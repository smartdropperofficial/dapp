import React from 'react';
import MessageBubble from './MessageBubble'; // Importa il componente MessageBubble
import { Spinner } from 'react-bootstrap';
import { MessageSB } from '@/types/OrderSB';

interface MessagesListProps {
    messages: MessageSB[];
    loggedInAddress: string | undefined;
    isLoadingMessages: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({ messages, loggedInAddress, isLoadingMessages }) => {
    if (isLoadingMessages) {
        return <Spinner animation="grow" variant="warning" />;
    }

    if (!messages || messages.length === 0) {
        return <p>No messages found.</p>;
    }

    return (
        <div className="d-flex overflow-y-auto">
            {messages.map((mgs: MessageSB) => (
                <MessageBubble
                    key={mgs.id}
                    sender={mgs.sender}
                    content={mgs.content}
                    timestamp={mgs.msg_timestamp}
                    status={mgs.status}
                    isSentByLoggedInUser={mgs.sender === loggedInAddress}
                    read={mgs.read}
                />
            ))}
        </div>
    );
};

export default MessagesList;
