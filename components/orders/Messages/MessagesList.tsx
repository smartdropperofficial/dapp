import React from 'react';
import MessageBubble from './MessageBubble'; // Importa il componente MessageBubble
import { Spinner } from 'react-bootstrap';

interface MessagesListProps {
    messages: Message[];
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
        <div className='d-flex overflow-y-auto'>
            {messages.map((mgs: Message) => (
                <MessageBubble
                    key={mgs.id}
                    senderAddress={mgs.sender_wallet_address}
                    content={mgs.content}
                    timestamp={mgs.msg_timestamp}
                    status={mgs.status}
                    isSentByLoggedInUser={mgs.sender_wallet_address === loggedInAddress}
                />
            ))}
        </div>
    );
};

export default MessagesList;
