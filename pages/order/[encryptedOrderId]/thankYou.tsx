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
    const configCtx = useContext(ConfigContext);

    const router = useRouter();
    const { encryptedOrderId } = router.query;
    const orderId = decryptData(encryptedOrderId as string);

    const isFetching = useRef<boolean>(false);
    const delay = useRef<number | null>(10000);

    const [order, setOrder] = useState<OrderSB | null>(null);

    const processError = async (status: OrderStatus, errorText: string) => {
        const updateDb: OrderSB = {
            status: status,
        };

        await updateOrder(order!.order_id!, updateDb);

        delay.current = null;
        return Swal.fire({
            title: errorText,
            icon: 'error',
        }).then(result => {
            if (result.isConfirmed) {
                router.push('/my-orders');
            }
        });
    };

    const fetchStatus = async () => {
        if (order) {
            const amountToPay = await getAmountToPay(configCtx, order?.tax_request_id!);

            if (amountToPay && amountToPay.error) {
                if (amountToPay.error !== 'request_processing') {
                    console.log(amountToPay.error);
                    switch (amountToPay.error) {
                        case 'product_unavailable':
                            processError(OrderStatus.PRODUCT_UNAVAILABLE, 'Product unavailable, please try again or contact the support.');
                            break;
                        case 'shipping_address_refused':
                            processError(OrderStatus.SHIPPING_ADDRESS_REFUSED, 'Shipping address refused, please try again or contact the support.');
                            break;
                        case 'cannot_schedule_delivery':
                            processError(OrderStatus.SHIPPING_ADDRESS_REFUSED, 'Shipping address refused, please try again or contact the support.');
                            break;
                        case 'invalid_client_token':
                            processError(OrderStatus.ERROR, 'Error during the request, please try again or contact the support.');
                            break;
                        default:
                            processError(OrderStatus.ERROR, 'Error during the request, please try again or contact the support.');
                            break;
                    }
                } else {
                    isFetching.current = false;
                }
            } else if (amountToPay && !amountToPay.error) {
                const newProducts = order.products?.map(product => {
                    try {
                        const price = amountToPay.products.filter((p: AmazonProduct) => p.product_id === product.asin)[0].price;
                        return {
                            ...product,
                            price: price / 100,
                        };
                    } catch {
                        return {
                            ...product,
                        };
                    }
                });

                const updateDb: OrderSB = {
                    status: OrderStatus.WAITING_CONFIRMATION,
                    products: newProducts,
                    tax_amount: amountToPay.tax,
                    subtotal_amount: amountToPay.subtotal,
                    total_amount: amountToPay.total,
                    shipping_amount: amountToPay.shipping,
                };

                const hasUpdated = await updateOrder(order.order_id!, updateDb);

                if (hasUpdated) {
                    console.log('🚀 ~ file: thankYou.tsx:111 ~ fetchStatus ~ hasUpdated:', hasUpdated);
                    const encryptedOrderId = encryptData(order.order_id!);
                    router.push(`/pay/${encryptedOrderId}/checkout`);
                } else {
                    console.log('🚀 ~ file: thankYou.tsx:114 ~ fetchStatus ~ hasUpdated:', hasUpdated);

                    delay.current = null;
                    return Swal.fire({
                        title: 'Error during the request, please try again or contact the support.',
                        icon: 'error',
                    }).then(result => {
                        if (result.isConfirmed) {
                            router.push('/my-orders');
                        }
                    });
                }
            }
        } else {
            console.log(' isFetching.current = false;');
            isFetching.current = false;
        }
    };

    useInterval(async () => {
        if (!isFetching.current) {
            // isFetching.current = true;
            await fetchStatus();
        }
    }, delay.current);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const currentOrder = await getOrder(orderId);

            if (currentOrder?.status === OrderStatus.WAITING_TAX) {
                setOrder(currentOrder);
            } else {
                router.push('/my-orders');
            }
        };
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <div className="col-lg-6 px-0 px-lg-3">
                    <Card>
                        <div className="card-title">
                            <h1 className="mw-70 mb-5">
                                <Countdown
                                    date={Date.now() + 1800000}
                                    precision={1}
                                    renderer={({ minutes, seconds }) => (
                                        <span>
                                            {zeroPad(minutes)}:{zeroPad(seconds)}
                                        </span>
                                    )}
                                />
                                <span className="d-block mt-2">
                                    Grab a coffee while we elaborate your order <br></br>
                                    <strong className="text-primary"> on blockchain!</strong>
                                </span>
                            </h1>
                            <div className="img-check-completed position-relative d-flex justify-content-center">
                                <Image src="/assets/coffee-cup.png" width={250} height={250} alt="Order completed" />
                            </div>
                        </div>
                        <div className="card-title text-center mt-5">
                            <h5>Order N°{orderId}</h5>
                            <p className="text-center font-weight-light mt-3 px-4">
                                After a few hours you will be automatically redirected to <strong>complete the payment</strong>. If the countdown is set to zero
                                and the page {"doesn't"} change go to <Link href="/my-orders">My Orders</Link> section.
                                <br />
                                <br />
                                You can close this page at anytime.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderCompleted;
