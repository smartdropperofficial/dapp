import { SessionExt } from '@/types/SessionExt';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React from 'react'
import { Badge, Button } from 'react-bootstrap';
interface ProtectedPageProps {
    session: SessionExt;
}
const Messages: React.FC<ProtectedPageProps> = () => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    if (status === "loading") {
        return <div>Loading...</div>;
    }
    if (!session) {
        return <></>;
    }

    return (
        <Button variant="dark px-2">
            <i className="fa-solid fa-message mx-2 " style={{ color: '#ff9900', fontSize: '1.2em' }}></i>

            <Badge bg="secondary mx-2">9</Badge>
            {/* <span className="visually-hidden"></span> */}
        </Button>
    );
};

export default Messages

