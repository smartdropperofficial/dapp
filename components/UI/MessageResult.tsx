import React, { useState, useEffect, useRef } from 'react';
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

    const scrollableDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchMessages(ticketId: string) {
            setIsLoading(true);
            let { data: msgs, error } = await supabase.rpc('get_support_ticket_messages', { p_ticket_id: ticketId });
            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                setMessages(msgs || []);
            }
            setIsLoading(false);
        }

        if (ticket && ticket?.id) {
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
            // Controlla se il messaggio esiste già nel database
            const existingMessage = messages.find(
                (msg) =>
                    msg.content === newMsg.content &&
                    msg.msg_timestamp === newMsg.msg_timestamp &&
                    msg.sender === newMsg.sender
            );

            if (!existingMessage) {
                const { data, error } = await supabase.from('support_tickets_messages').insert([newMsg]).select();
                if (error) {
                    Swal.fire({ icon: 'error', title: 'Message not delivered! ', text: error.message });
                    return;
                }
                setMessages([...messages, newMsg]);
            }
        };

        if (newMessage && ticket) {
            AddMessageToDB(newMessage).then(() => setNewMessage(null)); // Resetta `newMessage` dopo l'aggiunta
        }
    }, [newMessage]);

    // Effetto per scrollare al fondo
    useEffect(() => {
        if (scrollableDivRef.current) {
            scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
        }
    }, [messages]);

    if (isLoading)
        return (
            <div className="d-flex justify-content-center align-items-center h-100 w-100 d-flex flex-column w-75">
                <div className={`${styles.loader} `}></div>
                <span className="ms-2">Loading messages...</span>
            </div>
        );

    return (
        <div className="h-100 w-100 ">
            <div
                className="h-100 col-12 d-flex flex-column h-100 overflow-y-scroll overflow-x-hidden"
                style={{ maxHeight: '300px' }}
                ref={scrollableDivRef}
            >
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
            {messages[messages.length - 1]?.sender !== session?.address && (
                <div style={messageInputContainerStyle}>
                    <MessageInputBox onSendMessage={handleSendMessage} />
                </div>
            )}
        </div>
    );
}

export default MessageResult;
