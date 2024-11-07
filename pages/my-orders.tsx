import Card from '../components/UI/Card';
import { useContext, useEffect, useState } from 'react';
import { OrderSB } from '../types/OrderSB';
import MyOrderList from '../components/orders/MyOrderList';
import { getSession, GetSessionParams, useSession } from 'next-auth/react';
import Loading from '../components/UI/Loading';
import { encryptData } from '../utils/utils';
import { SessionExt } from '../types/SessionExt';
import { useAccount, useDisconnect } from 'wagmi';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ConfigContext } from '@/store/config-context';
import { GetServerSideProps } from 'next';
import OrderTable from '@/components/OrderTable/OrderTable';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { withAuth } from '@/withAuth';

const MyOrders = () => {
    const { disconnect } = useDisconnect();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const { address } = useAccount();
    const [orders, setOrders] = useState<OrderSB[] | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [shouldHydrate, setShouldHydrate] = useState(false);
    const router = useRouter();

    // Check if the necessary data is available for hydration
    useEffect(() => {
        if (!isLoading && session?.address && ((orders && orders.length > 0) || address)) {
            setShouldHydrate(true);
            // appCtx.setIsLoadingHandler(isLoading);
        }
    }, [isLoading, session, orders, address]);

    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                setIsLoading(true);

                const encryptedAddress = encryptData(session?.address!);
                const response = await fetch(`/api/getOrders?${new URLSearchParams({ address: encryptedAddress })}`);
                const orders = await response.json();

                if (orders.length > 0) {
                    setOrders(orders);
                }
            } catch {
                console.log('err');
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.address && session?.address === address) {
            fetchUserOrders();
        }
    }, [session?.address, address]);

    // useEffect(() => {
    //     if (!address) {
    //         disconnect();
    //         router.push('/login');
    //     } else if (address && session?.address && session?.address === address) {
    //         router.push('/');
    //     }
    // }, [address, session?.address]);

    return (
        <>
            <Head>
                <title>My Orders | Smart Dropper</title>
                {/* Remove suppressHydrationWarning if it's causing any issues */}
                {/* <time dateTime="2016-10-25" suppressHydrationWarning /> */}

                {/* <meta name="description" content="Smartshopper is the first decentralized platform that allows users to buy on Amazon by just using their DeFi Wallet, like Metamask or TrustWallet." /> */}
            </Head>

            {shouldHydrate && (
                <div className="container h-100 d-flex justify-content-center align-items-center">
                    <div className="row w-100 justify-content-center">
                        <div className="col-lg-10 p-0">
                            <div className="card-title">
                                <div className="row mt-5">
                                    <div className="col-12 justify-content-center text-center">
                                        {!isLoading && session?.address && orders && orders.length > 0 ? (
                                            // <MyOrderList orders={orders} />
                                            <OrderTable ordersProps={orders} />
                                        ) : !isLoading && session?.address && address && (!orders || orders.length < 1) ? (
                                            <Card>
                                                {' '}
                                                <div className="text-center">No orders found for this address.</div>
                                            </Card>
                                        ) : !address ? (
                                            // <div className="text-center">Connect wallet to view your orders.</div>
                                            <></>
                                        ) : (
                                            // <Loading dark={true} />
                                            <ModalOverlay show={true}>
                                                <Loading dark={false} />
                                            </ModalOverlay>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrders;

export const getServerSideProps = withAuth(async (context: any, session: any) => {
    return {
        props: {
            session,
        },
    };
});
