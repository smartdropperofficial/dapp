import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useSession } from 'next-auth/react';
import MessageBubble from '@/components/orders/Messages/MessageBubble';
import MessageInputBox from '@/components/orders/Messages/MessageInputBox';
import { messageInputContainerStyle } from '@/components/orders/Messages/messageInputBoxStyles';
import { supabase } from '@/utils/supabaseClient';
import { MessageSB } from '@/types/OrderSB';
import { SessionExt } from '@/types/SessionExt';
import Swal from 'sweetalert2';
import MessageResult from './MessageResult';

interface OffCanvasResultProps {
    show: boolean;
    setShow: (value: boolean) => void;
    orderId: string;
    ticket: any;
}

function OffCanvasResult({ show, setShow, orderId, ticket }: OffCanvasResultProps) {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const handleClose = () => setShow(false);
    const [messages, setMessages] = useState<MessageSB[]>([]);
    const [newMessage, setNewMessage] = useState<MessageSB | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchMessages(ticketId: string) {
            setIsLoading(true);
            let { data: msgs, error } = await supabase.rpc('get_ticket_messages', { p_ticket_id: ticketId });
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

    // const handleSendMessage = (content: string) => {
    //     const newMsg: MessageSB = {
    //         sender: session?.address || '',
    //         content: content,
    //         email: session?.email,
    //         msg_timestamp: new Date().toISOString(),
    //         status: 'sent',
    //         ticket_id: ticket?.id || '', // Usa il ticketId appena creato
    //         read: false,
    //     };
    //     setNewMessage(newMsg);
    // };

    useEffect(() => {
        const AddMessageToDB = async (newMsg: MessageSB) => {
            const { data, error } = await supabase.from('messages').insert([newMsg]).select();
            if (error) {
                Swal.fire({ icon: 'error', title: 'Message not delivered! ', text: error.message });
                return;
            }
            setMessages([...messages, newMsg]);
        };

        if (newMessage && ticket) {
            AddMessageToDB(newMessage);
        }
    }, [newMessage, ticket]);

    return (
        <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Header closeButton>{ticket && <Offcanvas.Title>Order: #{ticket?.order_id}</Offcanvas.Title>}</Offcanvas.Header>
            <Offcanvas.Body className="col-12 d-flex flex-column h-100 overflow-y-hidden" style={{ maxHeight: '100%' }}>
                <MessageResult orderId={orderId} ticket={ticket} />
            </Offcanvas.Body>
            {/* <div style={messageInputContainerStyle}>
                <MessageInputBox onSendMessage={handleSendMessage} />
            </div> */}
        </Offcanvas>
    );
}

export default OffCanvasResult;
