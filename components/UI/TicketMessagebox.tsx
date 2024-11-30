import React from 'react';
import { Card } from 'react-bootstrap';

interface TicketMessageboxProps {
    show: boolean;
    setShow: (value: boolean) => void;
    orderId: string;
    ticket: any;
    children: any;
}

function TicketMessagebox({ show, setShow, orderId, ticket, children }: TicketMessageboxProps) {
    return (
        <div>
            <Card className=" border-0 d-flex justify-content-center align-items-center" >{children}</Card>
        </div>
    );
}

export default TicketMessagebox;
