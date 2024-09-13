

import { SessionExt } from "@/types/SessionExt";
import { supabase } from "@/utils/supabaseClient";
import { getSession, GetSessionParams, useSession } from "next-auth/react";
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
// export async function getServerSideProps(context: GetSessionParams | undefined ) {
//     const session :  SessionExt | null  = await getSession(context); // Recupera la sessione come preferisci
//     console.log("🚀 ~ getServerSideProps ~ session:", session)
  
//     if (!session || session.email === '' || session.verified === false) {
//         return {
//             redirect: {
//                 destination: '/verify-email',
//                 permanent: false,
//             },
//         };
//     }

//     return {
//         props: {
//             session,
//         },
//     };
// }
