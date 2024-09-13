import { useSendCode } from '@/hooks/useSendCode';
import { SessionExt } from '@/types/SessionExt';
import { supabase } from '@/utils/supabaseClient';
import { useSession } from 'next-auth/react';
import React, { useContext, useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { SendEmailVerificationCode } from '@/components/controllers/EmailController';
import { ConfigContext } from '@/store/config-context';
import { useAccount } from 'wagmi';
import router from 'next/router';
import MailManagement from '@/components/UI/MailManagement';

function VerifyEmail() { 
    const { address } = useAccount();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    useEffect(() => {
        if (session?.verified) {
            router.push('/');
        } else {
            router.push('/verify-email');
        }
    }, [session?.verified])

    useEffect(() => {
        if (!address) {
            router.push('/login');
        }
    }, [address]);

    return <MailManagement/>;
}

export default VerifyEmail;
