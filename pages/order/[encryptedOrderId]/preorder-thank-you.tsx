import Card from '../../../components/UI/Card';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { decryptData, encryptData } from '../../../utils/utils';
import Countdown, { zeroPad } from 'react-countdown';
import { useInterval } from '../../../hooks/useInterval';
import { useContext, useEffect, useRef, useState } from 'react';
import { getAmountToPay } from '../../../components/controllers/PaymentController';
import { getOrder, updateOrder } from '../../../components/controllers/OrderController';
import { OrderSB } from '../../../types/OrderSB';
import Swal from 'sweetalert2';
import { OrderStatus } from '../../../types/Order';
import { AmazonProduct } from '../../../types/OrderAmazon';
import { ConfigContext } from '@/store/config-context';

const OrderCompleted = () => {
    const router = useRouter();
    const { encryptedOrderId } = router.query;
    const orderId = decryptData(encryptedOrderId as string);
    const [OrderId, setOrderId] = useState('');
    const config_context = useContext(ConfigContext);

    useEffect(() => {
        if (orderId !== undefined) {
            setOrderId(orderId!);
        }
    }, [orderId]);
    useEffect(() => {
        config_context.setIsLoading(false);
    }, []);

    return (
        OrderId && (
            <div className="container h-100 d-flex justify-content-center align-items-center">
                <div className="row w-100 justify-content-center">
                    <div className="col-lg-6 px-0 px-lg-3">
                        <Card>
                            <div className="card-title">
                                <h1 className="mw-70 mb-5">
                                    {/* <Countdown
                                    date={Date.now() + 1800000}
                                    precision={1}
                                    renderer={({ minutes, seconds }) => (
                                        <span>
                                            {zeroPad(minutes)}:{zeroPad(seconds)}
                                        </span>
                                    )}
                                /> */}
                                    <span className="d-block mt-2">
                                        <br></br>
                                        <strong className="text-primary"> Grab a coffee while we elaborate your order! </strong>
                                    </span>
                                </h1>
                                <div className="img-check-completed position-relative d-flex justify-content-center">
                                    <Image src="/assets/coffee-cup.png" width={250} height={250} alt="Order completed" />
                                </div>
                            </div>
                            <div className="card-title text-center mt-5">
                                <h5>Order N°{orderId}</h5>
                                <p className="text-center font-weight-light mt-3 px-4">
                                    You will receive a email with <b>Shipping</b> and <b>Tax price</b> to <strong>complete the order</strong>. You can also
                                    monitor the status of your on the page <Link href="/my-orders">My Orders</Link> section.
                                    <br />
                                    <br />
                                    You can close this page at anytime.
                                </p>
                                <p className="text-center font-weight-light mt-3 px-4">
                                    <br />
                                    <br />
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    );
};

export default OrderCompleted;
