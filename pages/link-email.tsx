// pages/link-email.tsx

import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useAccount, useDisconnect } from 'wagmi';

export default function LinkEmail() {
    const router = useRouter();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { update } = useSession();
    const [email, setEmail] = useState('');
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [emailError, setEmailError] = useState(false);
    const [isSending, setIsSeding] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [token, setToken] = useState<string | undefined>(undefined);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSeding(true);
        try {
            const res = await fetch('/api/send-email-verification', {
                method: 'POST',
                body: JSON.stringify({ email, walletAddress: session?.address }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Mail has been sent. Check your mail box!' });
            } else {
                alert('Errore durante l’invio dell’email di verifica.');
                Swal.fire({ icon: 'error', title: 'Mail has been sent. Check your mail box!' });
            }
        } catch (error) {
        } finally {
            setIsSeding(false);
            setEmail('');
        }
    };
    const handleEmailVerification = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        console.log('🚀 ~ handleEmailVerification ~ emailRegex:', emailRegex);

        if (email && emailRegex.test(email)) {
            setEmailError(false);
            return true;
        } else {
            setEmailError(true);
            return false;
        }
    };
    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        }
    }, [address]);

    useEffect(() => {
        if (session?.verified) {
            router.push('/');
        }
    }, [session?.verified]);

    useEffect(() => {
        if (!router.isReady) return;
        const { token } = router.query;
        setToken(token as string);
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (email) {
            handleEmailVerification(email);
        }
    }, [email]);

    useEffect(() => {
        console.log('🚀 ~ useEffect ~ session:', session);
        console.log('🚀 ~ useEffect ~ token:', token);
        if (token && session && session.verified === false) {
            console.log('🚀 ~ useEffect ~ token:', token);
            verifyEmail(token);
        }
    }, [token, session]);

    const verifyEmail = async (token: string) => {
        setVerifying(true);
        const res = await fetch('/api/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.ok) {
            const updateSession = await update({ verified: true });
            setVerifying(false);
            console.log('🚀 ~ verifyEmail ~ updateSession:', updateSession);
            Swal.fire({ icon: 'success', title: 'Mail has been verified!' }).then(() => {
                router.push('/');
            });
        } else {
            setVerifying(false);
            Swal.fire({ icon: 'error', text: res.status.toString(), title: 'Errr on revifying mail.' }).then(() => {
                router.push('/');
            });
        }

        setToken('');
    };
    if (verifying) {
        return (
            <ModalOverlay show={true}>
                <Loading dark={true} loadingText={'Verifying EMail....'} />
            </ModalOverlay>
        );
    }
    return (
        <div className="container my-5 d-flex justify-content-center">
            <Card className="text-center" style={{ maxWidth: '500px' }}>
                <Card.Body className="d-flex flex-column justify-content-center text-center align-items-center">
                    <div className="alert alert-warning" role="alert">
                        <h4 className="alert-heading">New wallet!</h4>
                        <p>
                            Hello, this a new wallet for our system. As email is our only means of communication, if you already have an account, please, simply
                            enter the email associated with it to link the wallet to your existing account.
                        </p>
                    </div>
                    <div className="col-12">
                        <form onSubmit={handleSubmit} className="col-12 d-flex flex-column justify-content-center ">
                            <label className="col-12">
                                Email:
                                <input
                                    className="form-control col-12"
                                    type="email"
                                    name="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    // onChange={e => handleEmailVerification(e.target.value)}
                                    placeholder="Type your email address"
                                />
                            </label>
                            <br />
                            <button type="submit" className="btn  btn-primary col-12 " disabled={isSending}>
                                {isSending ? 'Sending...' : 'Link your Email'}
                            </button>
                            {emailError && email && <span className="text-danger">Email format error</span>}
                        </form>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
