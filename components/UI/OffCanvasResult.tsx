import React, { useState, useEffect, ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
import MessageBubble from '@/components/orders/Messages/MessageBubble';  // Assicurati che il percorso sia corretto
import MessageInputBox from '@/components/orders/Messages/MessageInputBox';  // Assicurati che il percorso sia corretto
import {
    messageInputContainerStyle
} from '@/components/orders/Messages/messageInputBoxStyles';  // Importa lo stile dal file di stili
import { supabase } from '@/utils/supabaseClient';
import { MessageSB } from '@/types/OrderSB';

interface OffCanvasResultProps {
    show: boolean;
    setShow: (value: boolean) => void;
    orderId: string;
}

function OffCanvasResult({ show, setShow, orderId }: OffCanvasResultProps) {
    const { address } = useAccount();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const handleClose = () => setShow(false);
    const [messages, setMessages] = useState<MessageSB[]>([]);
    const [newMessage, setNewMessage] = useState<MessageSB | null>();
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

    useEffect(() => {
        async function fetchSupportTickets(orderId: string) {
            let { data: msgs, error } = await supabase
                .rpc('get_messages_by_order_id', { order_id_input: orderId });

            if (error) {
                console.error('Error fetching support tickets:', error);
                return;
            }

            setMessages(msgs || []);
            setIsLoadingMessages(false);
        }

        if (orderId && orderId !== '') {
            setIsLoadingMessages(true);
            fetchSupportTickets(orderId);
        }
    }, [orderId]);
    useEffect(() => {
        const AddmessageToBD = async (newMsg: MessageSB) => {
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        sender_wallet_address: newMsg.sender_wallet_address,
                        receiver_wallet_address: newMsg.receiver_wallet_address,
                        msg_timestamp: newMsg.msg_timestamp,
                        status: newMsg.status,
                        content: newMsg.content,
                        read: newMsg.read,
                        ticket_id: newMsg.ticket_id

                    },
                ])
                .select()
            if (error) {
                setNewMessage(null)
            }
            console.error(error)
            if (data) {
                setNewMessage(null)
                console.log(data)
            }
        }
        if (newMessage && messages && messages.length > 0) {
            AddmessageToBD(newMessage);
        }
    }, [newMessage])

    useEffect(() => {
        console.log("newMessage:", newMessage)
    }, [newMessage])


    const handleSendMessage = (content: string) => {
        const newMsg: MessageSB = {
            // id: Math.random().toString(36).substr(2, 9), // Genera un ID univoco temporaneo
            sender_wallet_address: session?.address || '',
            receiver_wallet_address: messages[0]?.receiver_wallet_address, // Cambia con l'indirizzo reale del destinatario
            content: content,
            msg_timestamp: new Date().toISOString(),
            status: 'sent',
            ticket_id: messages[0]?.ticket_id,
            read: false
        };
        setNewMessage(newMsg)
        setMessages([...messages, newMsg]);
        // Invia il messaggio al server
        // Aggiungi qui la logica per inviare il messaggio al server, ad esempio tramite Supabase o un'altra API.
    };

    return (
        <Offcanvas show={show} onHide={handleClose} placement='end'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Order:#{orderId}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className='col-12 d-flex flex-column p-5 overflow-y-auto' style={{ maxHeight: '75%' }}>
                {isLoadingMessages ? (
                    <Spinner animation="grow" variant="warning" />
                ) : (
                    messages && messages.length > 0 && messages.map((mgs: MessageSB, i: number) => (
                        <MessageBubble
                            key={mgs.id}
                            senderAddress={mgs.sender_wallet_address}
                            content={mgs.content}
                            timestamp={mgs.msg_timestamp}
                            status={mgs.status}
                            isSentByLoggedInUser={mgs.sender_wallet_address === session?.address}
                        />
                    ))
                )}
            </Offcanvas.Body>
            <div style={messageInputContainerStyle}>
                <MessageInputBox onSendMessage={handleSendMessage} />
            </div>
        </Offcanvas>
    );
}

export default OffCanvasResult;
