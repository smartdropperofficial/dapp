import MyOrderList from '@/components/orders/MyOrderList';
import Order from '@/components/orders/Order';
import { OrderSB } from '@/types/OrderSB';
import { decryptData } from '@/utils/utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Button, Card } from 'react-bootstrap';
import ModalOverlay from '@/components/UI/ModalOverlay';
import Loading from '@/components/UI/Loading';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';

function OrderDetails() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { encryptedOrderId } = router.query;
    const [redirectUrl, setRedirectUrl] = useState(''); // Correzione nome variabile
    const redirectPath = '/order/[encryptedOrderId]/order-details'; // Non serve stato
    const { data: session } = useSession() as { data: SessionExt | null };
    const [order, setOrder] = useState<OrderSB | null>(null);
    const orderId = decryptData(encryptedOrderId as string);

    useEffect(() => {
        if (encryptedOrderId) {
            console.log('🚀 ~ Encrypted Order ID:', encryptedOrderId);
            const decodedOrderId = decodeURIComponent(encryptedOrderId as string);
            console.log('🚀 ~ Decoded Order ID:', decodedOrderId);

            const tmpRedirectUrl = redirectPath.replace('[encryptedOrderId]', encryptedOrderId as string);
            console.log('🚀 ~ Redirect URL before setting state:', tmpRedirectUrl);
            setRedirectUrl(tmpRedirectUrl);
        }
    }, [encryptedOrderId]);

    useEffect(() => {
        if (!session && !address && encryptedOrderId && redirectUrl !== '') {
            console.log('🚀 ~ Redirecting to login with URL:', redirectUrl);
            setTimeout(() => {
                router.push(`/login?redirect=${redirectPath.replace('[encryptedOrderId]', encodeURIComponent(encryptedOrderId as string))}`);
            }, 100); // Ritardo di 100ms per garantire la disponibilità di tutti i dati
        }
    }, [session, address, encryptedOrderId, redirectUrl]);

    useEffect(() => {
        const fetchOrder = async () => {
            const { data, error } = await supabase.from('orders').select('*').eq('order_id', orderId);

            if (error) {
                console.error('Error fetching order:', error);
                router.push('/my-orders');
            } else if (!data || data.length === 0) {
                console.error('No order found for orderId:', orderId);
                router.push('/my-orders');
            } else {
                setOrder(data[0]);
            }
        };

        if (orderId && session && address) {
            fetchOrder();
        }
    }, [orderId, session, address]);

    if (!orderId) {
        return (
            <div>
                <ModalOverlay show={true}>
                    <Loading loadingText="Loading order details..." />
                </ModalOverlay>
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <ModalOverlay show={true}>
                    <Loading loadingText="Fetching order details..." />
                </ModalOverlay>
            </div>
        );
    }

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <div className="col-lg-8 p-0">
                    <Card className="col-12 justify-content-center text-center">
                        <Order order={order} />
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;
