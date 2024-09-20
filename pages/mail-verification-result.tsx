import { SessionExt } from '@/types/SessionExt';
import { getSession, signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import Image from 'next/image';

function MailVerificationResult() {
    const router = useRouter();

    const { token } = router.query;
    const { data: session } = useSession() as { data: SessionExt | null };
    useEffect(() => {
        if (token && session) {
            console.log('🚀 ~ useEffect ~ token:', token);
            verifyEmail(token as string);
        }
    }, [token, session]);
    useEffect(() => {
        // Esegui qualche operazione per verificare lo stato della sessione
        const checkSession = async () => {
            const session = await getSession();
            console.log('Session corrente:', session);
        };

        checkSession();
    }, []);
    const verifyEmail = async (token: string) => {
        const res = await fetch('/api/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('res', res);
        if (res.ok) {
            const signInResponse = await signIn('refresh-token', {
                redirect: false,
            });
            console.log('signInResponse:', signInResponse);

            // const session: SessionExt | null  = await getSession();
            console.log('Sessione aggiornata:', session);
            if (session?.verified === false) {
                // router.push('/');
            }
        } else {
            // alert('Errore nella verifica dell’email.');
        }
    };

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <div className="col-lg-7">
                    <Card>
                        <div className="card-title">
                            <div className="img-check-completed position-relative d-flex justify-content-center">
                                <Image src="/assets/check.png" width={250} height={250} alt="Order completed" />
                            </div>
                            <h1 className="mt-5">Verification completed!</h1>
                        </div>
                        <div className="card-title text-center mt-4">
                            <h5>Your wallet has bene linked to your account! </h5>
                            <p className="font-weight-light">
                                You can now view your order in <Link href="/">Order now</Link> section.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default MailVerificationResult;
