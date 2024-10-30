import React from 'react';

interface MessageBubbleProps {
    sender: string;
    content: string;
    timestamp: string;
    status: string;
    isSentByLoggedInUser: boolean;
    read: boolean;
    order_id: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender: senderAddress, content, timestamp, status, isSentByLoggedInUser, read, order_id }) => {
    const formatDate = (timestamp: string) => new Date(timestamp).toLocaleString();

    return (
        <div className={`message-container d-flex flex-column  px-3 ${isSentByLoggedInUser ? 'sent' : 'received'}`}>
            <div className="d-flex">
                <span className="disclaimer w-100 d-flex justify-content-start mx-1"> {formatDate(timestamp)}</span>
            </div>
            <div className="message-bubble col-12 d-flex ">
                <div>
                    <strong className="">From: </strong>
                    <span className="disclaimer">{isSentByLoggedInUser ? 'Me' : 'Smart Dropper'}</span>
                </div>
                <br />
                <div>
                    <strong>Message: </strong> <span>{content}</span>
                </div>
                <br />
                {/* <strong>Status:</strong> {status} */}
                <div>
                    {' '}
                    <span className="disclaimer d-flex  justify-content-end me-2 mt-1">
                        <div className="mx-1"> {read && isSentByLoggedInUser ? 'read' : 'sent'}</div>
                        <div>
                            {read && isSentByLoggedInUser ? (
                                <i className="fa-solid fa-check-double" style={{ color: 'green' }}></i>
                            ) : (
                                <i className="fa-solid fa-check" style={{ color: 'grey' }}></i>
                            )}
                        </div>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
