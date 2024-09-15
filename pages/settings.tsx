import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import router from 'next/router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import LoginForm from './components/LoginForm';
import { Button, Card } from 'react-bootstrap';

const Settings = () => {
    const { address } = useAccount();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    useEffect(() => {
        if (!session) {
            router.push('/login');
        }
    }, [session]);
    return (
        <div className="container my-5 d-flex justify-content-center">
            <Card className="text-center" style={{ maxWidth: '1000px' }}>
                <Card.Body className="d-flex flex-column justify-content-center">
                    <Card.Title as="h2" className="mb-3">
                        <div className="d-flex flex-column">
                            <span> Change Email</span>
                        </div>
                    </Card.Title>
                    <div>
                        <>Here you can change your email address.</> <br />{' '}
                        <p className="disclaimer mt-3">
                            Email is the only personal data we gather from our customers. We will use this email for all our communications with you. If you
                            can&apos;t find our application received email, please check your spam inbox
                        </p>
                    </div>
                    <LoginForm />
                </Card.Body>
            </Card>
        </div>
    );
};

export default Settings;
