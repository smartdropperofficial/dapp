// pages/verify-email.tsx

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { token } = router.query;

    useEffect(() => {
        if (token) {
            console.log('🚀 ~ useEffect ~ token:', token);
            verifyEmail(token as string);
        }
    }, [token]);

    const verifyEmail = async (token: string) => {
        const res = await fetch('/api/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.ok) {
            alert('Email verificata e wallet associato con successo.');
            await signIn('credentials', {
                redirect: false, // Evita il redirect dopo il sign-in
            });

            // Reindirizza alla home o a una pagina desiderata
            router.push('/');
        } else {
            alert('Errore nella verifica dell’email.');
        }
    };

    return <p>Verifica in corso...</p>;
}
