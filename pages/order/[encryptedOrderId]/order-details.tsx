import MyOrderList from '@/components/orders/MyOrderList';
import Order from '@/components/orders/Order';
import { OrderSB } from '@/types/OrderSB';
import { decryptData } from '@/utils/utils';
import { useRouter } from 'next/router';
import React from 'react'
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Button, Card } from 'react-bootstrap';
import ModalOverlay from '@/components/UI/ModalOverlay';
import Loading from '@/components/UI/Loading';



function OrderDetails() {

    const router = useRouter();
    const { encryptedOrderId } = router.query;
    const orderId = decryptData(encryptedOrderId as string);
    const [order, setOrder] = useState<OrderSB | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('order_id', orderId);

            if (error) {
                console.error('Error fetching order:', error);
            } else {
                setOrder(data?.[0] || null);
            }
        };
        if (orderId) {
            fetchOrder();

        } else {
            router.push('/my-orders');
        }
    }, [orderId]);



    if (!order) {
        return <div>
            <ModalOverlay show={true}>
                <Loading loadingText="Checking tax..." />
            </ModalOverlay>
        </div>;
    }

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <div className="col-lg-8 p-0">
                    <div className="card-title">
                        <div className="row mt-5">
                            <Card className="col-12 justify-content-center text-center">
                                <Order order={order} />
                                <div className="order-buttons mt-3 text-end d-flex flex-column  align-items-center ">
                                    <div className="bg-white rounded-2 p-2 mt-4 d-flex justify-content-center flex-column">
                                        <h4 className="fw-bold">Shipping address: </h4>
                                        <br></br>
                                        <div className="fw-bold m-0 text-center">
                                            First name: <p className="fw-light">{order.shipping_info?.first_name}</p>
                                        </div>
                                        <div className="fw-bold m-0 text-center">
                                            Last Name: <p className="fw-light">{order.shipping_info?.last_name}</p>
                                        </div>
                                        <div className="fw-bold m-0 text-center">
                                            Address 1: <p className="fw-light">{order.shipping_info?.address_line1}</p>
                                        </div>
                                        <div className="fw-bold m-0 text-center">
                                            City: <p className="fw-light">{order.shipping_info?.city}</p>
                                            <div className="fw-bold m-0">
                                                State: <p className="fw-light">{order.shipping_info?.state}</p>
                                            </div>
                                            <div className="fw-bold m-0 text-center">
                                                Zip: <p className="fw-light">{order.shipping_info?.zip_code}</p>
                                            </div>
                                            <div className="fw-bold m-0 text-center">
                                                Phone Number: <p className="fw-light">{order.shipping_info?.phone_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <div className='my-5'></div>
                            {/* <Card className='d-flex justify-content-center'>
                                <Button className='col-lg-6'>Open Request</Button>
                            </Card> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}




export default OrderDetails