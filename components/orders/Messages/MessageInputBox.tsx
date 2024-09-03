import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
    messageInputBoxStyle,
    inputStyle,
    buttonStyle,
    messageInputContainerStyle,
} from './messageInputBoxStyles';

interface MessageInputBoxProps {
    onSendMessage: (content: string) => void;
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            onSendMessage(message);
            setMessage(''); // Resetta il campo di input
        }
    };

    return (
        <div style={messageInputContainerStyle}>
            <div style={messageInputBoxStyle} className='d-flex flex-column '>
                <Form.Control
                    type="text"
                    className='my-1'

                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    style={inputStyle}
                />
                <Button variant="primary" className='my-1 col-12 rounded-5' onClick={handleSendMessage} style={buttonStyle}>
                    Send
                </Button>
            </div>
        </div>
    );
};

export default MessageInputBox;
