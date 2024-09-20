// pages/verify-email.tsx

import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { SessionExt } from '@/types/SessionExt';
import { getCsrfToken, getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SiweMessage } from 'siwe';
import Swal from 'sweetalert2';
import { signMessage } from 'viem/_types/accounts/utils/signMessage';
import { useAccount } from 'wagmi';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { token } = router.query;
    const { address, isConnected } = useAccount();
    // const { data: session, update} = useSession() as { data: SessionExt | null };
    const { data: session, update } = useSession();

    useEffect(() => {
        if (token && session) {
            console.log('🚀 ~ useEffect ~ token:', token);
            verifyEmail(token as string);
        }
    }, [token, session]);

    // useEffect(() => {
    //     // Esegui qualche operazione per verificare lo stato della sessione
    //     const checkSession = async () => {
    //         const session = await getSession();
    //         console.log('Session corrente:', session);
    //     };

    //     checkSession();
    // }, []);
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
            const updateSession = await update({ verified: true });
            console.log('🚀 ~ verifyEmail ~ updateSession:', updateSession);
            Swal.fire({ icon: 'success', title: 'Mail has been verified!' });
        } else {
            // alert('Errore nella verifica dell’email.');
            // Swal.fire({ icon: 'success', title: 'Mail has been verified!' });
        }
    };

    return (
        <ModalOverlay show={true}>
            <Loading dark={true} />
        </ModalOverlay>
    );
}
