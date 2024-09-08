

import { SessionExt } from "@/types/SessionExt";
import { supabase } from "@/utils/supabaseClient";
import { useSession } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAccount } from "wagmi"; 
import MailManagement from "@/components/UI/MailManagement";

const Settings = () => {     
    const { address } = useAccount();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    useEffect(() => {
        if (!address) {
            router.push('/login');
        }
    }, [address]);
    return <MailManagement/>;
};

export default Settings;
