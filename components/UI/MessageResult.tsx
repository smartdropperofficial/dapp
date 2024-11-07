import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import MessageBubble from '@/components/orders/Messages/MessageBubble';
import MessageInputBox from '@/components/orders/Messages/MessageInputBox';
import { messageInputContainerStyle } from '@/components/orders/Messages/messageInputBoxStyles';
import { supabase } from '@/utils/supabaseClient';
import { MessageSB } from '@/types/OrderSB';
import { SessionExt } from '@/types/SessionExt';
import Swal from 'sweetalert2';
import styles from '@/styles/spinner.module.scss';

interface MessageResultProps {
    orderId: string;
    ticket: any;
}

function MessageResult({ orderId, ticket }: MessageResultProps) {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const [messages, setMessages] = useState<MessageSB[]>([]);
    const [newMessage, setNewMessage] = useState<MessageSB | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchMessages(ticketId: string) {
            setIsLoading(true);
            let { data: msgs, error } = await supabase.rpc('get_support_ticket_messages', { p_ticket_id: ticketId });
            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                setMessages(msgs || []);
            }
            console.log('🚀 ~ fetchMessages ~ msgs:', msgs);

            setIsLoading(false);
        }

        if (ticket && ticket?.id) {
            console.log('🚀 ~ useEffect ~ ticket:', ticket?.id);
            fetchMessages(ticket?.id);
        }
    }, [ticket]);

    const handleSendMessage = (content: string) => {
        const newMsg: MessageSB = {
            sender: session?.address || '',
            content: content,
            customer_email: session?.email,
            msg_timestamp: new Date().toISOString(),
            status: 'sent',
            ticket_id: ticket?.id || '',
            read: false,
            order_id: orderId,
        };
        setNewMessage(newMsg);
    };

    useEffect(() => {
        const AddMessageToDB = async (newMsg: MessageSB) => {
            const { data, error } = await supabase.from('support_tickets_messages').insert([newMsg]).select();
            if (error) {
                Swal.fire({ icon: 'error', title: 'Message not delivered! ', text: error.message });
                return;
            }
            setMessages([...messages, newMsg]);
        };

        if (newMessage && ticket) {
            AddMessageToDB(newMessage);
        }
    }, [newMessage]);

    if (isLoading)
        return (
            <div className="d-flex justify-content-center align-items-center h-100 w-100 d-flex flex-column w-75">
                {/* <Spinner animation="grow" variant="warning" /> */}
                <div className={`${styles.loader} `}></div>
                <span className="ms-2">Loading messages...</span>
            </div>
        );
    return (
        <div className="h-100 w-100 ">
            <div className="h-100 col-12 d-flex flex-column h-100  overflow-y-auto  overflow-x-hidden" style={{ maxHeight: '75%' }}>
                {/* {ticket && <h4>Order: #{ticket?.order_id}</h4>} */}
                {messages?.map((msg: MessageSB) => (
                    <MessageBubble
                        key={msg?.id}
                        sender={msg?.sender}
                        content={msg?.content}
                        timestamp={msg?.msg_timestamp}
                        status={msg?.status}
                        read={msg?.read}
                        isSentByLoggedInUser={msg.sender === session?.address}
                        order_id={msg.order_id}
                    />
                ))}
            </div>
            <div style={messageInputContainerStyle}>
                <MessageInputBox onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}

export default MessageResult;
