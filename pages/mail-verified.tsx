import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { getSession, GetSessionParams, useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';

function MailVerified() {
    const router = useRouter();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const GoToHomeHandler = async () => {
        router.push('/');
    };
    useEffect(() => {
        if (session && session?.verified === true) {
            router.push('/');
        } else {
            // alert('Email not verified')
        }
    }, [session]);

    return (
        <div className="container my-5 d-flex justify-content-center">
            <Card className="text-center" style={{ maxWidth: '500px' }}>
                <Card.Body className="d-flex flex-column justify-content-center text-center align-items-center">
                    <Card.Title as="h2" className="mb-3">
                        Email Verified
                    </Card.Title>
                    <div>Your email has been verified. You can now proceed to the next step.</div>
                    <img src="/assets/check.png" width={50} height={50} alt="Order completed" className="my-4" />
                    <div className="d-flex flex-lg-row flex-column justify-content-center align-items-center ">
                        Go to Home page
                        <div onClick={GoToHomeHandler} style={{ cursor: 'pointer' }}>
                            <img src="/icons/arrow-right-circle-fill.svg" width={30} height={30} alt="Order completed" className="primary mx-3" />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default MailVerified;
