import React, { useEffect, useState } from 'react';

import AddSubscription from '../hooks/Contracts/Subscription/components/AddSubscription';
import { Card, Container, Table } from 'react-bootstrap';
import AddPromoterForm from '../hooks/Contracts/Subscription/components/AddPromoterForm';
import GetPromoter from '../hooks/Contracts/Subscription/components/GetPromoter';
import { getSession, GetSessionParams, useSession } from 'next-auth/react';
import { SessionExt } from '../types/SessionExt';

import GetSubscription from '@/hooks/Contracts/Subscription/components/GetSubscription';
import router from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { GetServerSideProps } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { withAuth } from '@/withAuth';
import AddOrder from '@/hooks/Contracts/Order/components/AddOrder';
import FindSubsByAddress from '@/hooks/Contracts/Subscription/components/FindSubsByAddress';
import GetFunds from '@/hooks/Contracts/Subscription/components/GetFunds';

const Admin: React.FC = () => {
    const { disconnect } = useDisconnect();

    const { address, isConnected } = useAccount();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     if (!address) {
    //         router.push('/login');
    //     } else if (address && isConnected && session?.address === address && !session?.isAdmin) {
    //         router.push('/NotAuthorized');
    //     } else {

    //     }
    // }, [address, isConnected, session?.address, session?.isAdmin]);
    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        } else if (address && session?.address && session?.address === address) {
        }
    }, [address, session?.address]);

    useEffect(() => {
        if (address && isConnected && session?.address === address && !session?.isAdmin) {
            router.push('/NotAuthorized');
        } else {
        }
    }, [address, isConnected, session?.address, session?.isAdmin]);

    // if (isLoading) {
    //     return <ModalOverlay show={isLoading}><Loading loadingText={"Loading..."}></Loading></ModalOverlay>; // Puoi sostituirlo con un indicatore di caricamento o uno spinner
    // }
    return (
        <div className="container d-flex justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10 col-12 p-3 ">
                <div className="col-12 mb-3 p-1 ">
                    <Card className="col-lg-12">
                        <GetFunds></GetFunds>
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1 ">
                    <Card className="col-lg-12">
                        <AddPromoterForm></AddPromoterForm>
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1">
                    <Card className="col-12">
                        <AddSubscription></AddSubscription>{' '}
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1">
                    <Card className="col-lg-12 ">
                        <div className="my-3">
                            <GetPromoter></GetPromoter>
                        </div>
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1">
                    <Card>
                        <div className="my-3">
                            <GetSubscription></GetSubscription>
                        </div>
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1">
                    <Card>
                        <div className="my-3">
                            <AddOrder></AddOrder>
                        </div>
                    </Card>
                </div>
                <div className="col-12 mb-3 p-1">
                    <Card>
                        <div className="my-3">
                            <FindSubsByAddress></FindSubsByAddress>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
//     // Logica aggiuntiva per la tua pagina
//     return {
//         props: {
//             // Props aggiuntive per il tuo componente
//         },
//     };
// });
export default Admin;
