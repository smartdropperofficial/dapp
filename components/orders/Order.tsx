import { OrderSB, ProductSB } from '../../types/OrderSB';
import OrderProduct from './OrderProduct';
import { useEffect, useState, useContext, lazy, Suspense } from 'react';
import ModalOverlay from '../UI/ModalOverlay';
import { getOrder, getOrderStatusFromAmazon, updateOrder } from '../controllers/OrderController';
import { OrderStatus, OrderTableStatus } from '../../types/Order';
import { Tracking } from '../../types/Tracking';
import { getAmountToPay } from '../controllers/PaymentController';
import { AmazonProduct } from '../../types/OrderAmazon';
import { useRouter } from 'next/router';
import { encryptData, showInfoSwal } from '../../utils/utils';
import Swal from 'sweetalert2';
import Loading from '../UI/Loading';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { OrderContext } from '../../store/order-context';
import { ConfigContext } from '@/store/config-context';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
const OffCanvasResult = lazy(() => import('../UI/OffCanvasResult'));
import StatusSteps from './StatusSteps';
import { supabase } from '@/utils/supabaseClient';
import TicketMessagebox from '../UI/TicketMessagebox';
import MessageResult from '../UI/MessageResult';
import ChangeShippingInfo from '../steps/ChangeShippingInfo';
import Modal from '../UI/Modal';
// import OffCanvasResult from '../UI/OffCanvasResult';

interface IMyOrderProps {
    order: OrderSB;
}

const Order: React.FC<IMyOrderProps> = (props: IMyOrderProps) => {
    const { order: currentOrder } = props;
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();
    const orderCtx = useContext(OrderContext);
    const configCtx = useContext(ConfigContext);
    const [order, setOrder] = useState<OrderSB>(currentOrder);
    const [orderItems, setOrderItems] = useState<ProductSB[]>([]);
    const [returnItems, setReturnItems] = useState<ProductSB[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [OpenTicketCanvaas, setOpenTicketCanvaas] = useState<boolean>(false);
    const [amazonStatus, setAmazonStatus] = useState<any>();
    const [taxRequestId, setTaxRequestId] = useState<string>();
    const [isDelivered, setIsDelivered] = useState<boolean>(false);
    const [ticket, setTicket] = useState<any | null>(null);
    const [replacingOrder, setReplacingOrder] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<{ show: boolean; type: string; asin?: string }>({
        show: false,
        type: '',
    });
    const [isThirtyPassed, setIsThirtyPassed] = useState<number>(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const refetchOrder = async () => {
        const newOrder = await getOrder(order.order_id!);

        if (newOrder) {
            setOrder(newOrder);
        }
    };

    // const ReplaceOrder = async () => {
    //     setReplacingOrder(true);

    //     const UpdateOnDb = async () => {
    //         const updateDb: OrderSB = {
    //             status: OrderStatus.WAITING_TAX,
    //         };

    //         let { data: orders, error } = await supabase
    //             .from('orders')
    //             .update({ status: OrderStatus.WAITING_TAX })
    //             .eq('order_id', order.order_id!);
    //         if (error) {
    //             console.error('Error fetching order:', error);
    //             return;
    //         }
    //         refetchOrder();
    //     }

    //     const data = {
    //         amazon_api: configCtx?.config?.amazon_api!,
    //         order,
    //     };
    //     const encryptedOrder = encryptData(JSON.stringify(data));
    //     console.log('🚀 ~ createOrderOnAmazon ~ encryptedOrder:', encryptedOrder);

    //     try {
    //         const createOrderResponse = await fetch('/api/RetryOrderOnAmazon', {
    //             method: 'POST',
    //             body: encryptedOrder,
    //             headers: { 'Content-Type': 'plain/text' },
    //         });
    //         const response = await createOrderResponse.json();
    //         console.log('🚀 ~ createOrderOnAmazon ~ response:', response);

    //         switch (createOrderResponse.status) {
    //             case 201:
    //                 Swal.fire({
    //                     title: 'Order has been replaced successfully',
    //                     icon: 'success',
    //                 });
    //                 UpdateOnDb();
    //                 setReplacingOrder(false);
    //                 break;
    //             case 400:
    //             case 401:
    //             default:
    //                 Swal.fire({ icon: 'error', title: 'Error during the request, please try again or contact the support' });
    //         }
    //         setReplacingOrder(false);

    //     } catch (error) {
    //         setReplacingOrder(false);

    //         console.error('Error replacing order:', error);
    //         Swal.fire({ icon: 'error', title: 'Error during the request, please try again or contact the support' });
    //     }
    // }
    const fetchOrderStatus = async () => {
        setTaxRequestId(order.tax_request_id);

        if (order.request_id) {
            const tmpAmazonStatus = await getOrderStatusFromAmazon(order.request_id!);
            console.log(`fetchOrderStatus ~ for order ${order.request_id}:`, tmpAmazonStatus);
            setAmazonStatus(tmpAmazonStatus);
            setOrderItems(order.products!);

            if (tmpAmazonStatus?.tracking && tmpAmazonStatus.tracking !== 'waiting') {
                const tracking: Tracking[] = tmpAmazonStatus.tracking;

                const areAllDelivered: boolean[] = [];
                for (let i = 0; i < order.products!.length; i++) {
                    const isDelivered = tracking.some(track => track.product_ids?.includes(order.products![i].asin) && track.delivery_status === 'Delivered');
                    areAllDelivered.push(isDelivered);
                }

                if (areAllDelivered.every(del => del)) {
                    setIsDelivered(true);
                }
            }
        } else {
            setOrderItems(order.products!);
        }
    };

    const processError = async (status: OrderStatus, errorText: string) => {
        const updateDb: OrderSB = {
            status: status,
        };

        if (order && order.order_id) {
            await updateOrder(order.order_id!, updateDb);
        }
        refetchOrder();

        setIsLoading(false);
    };
    useEffect(() => {
        fetchStatus();
    }, [taxRequestId]);

    const fetchStatus = async () => {
        if (order.status === OrderStatus.WAITING_TAX && taxRequestId !== undefined && order && order.order_id) {
            console.log('🚀 ~ fetchStatus ~ taxRequestId:', taxRequestId);

            const amountToPay = await getAmountToPay(configCtx, taxRequestId!);
            console.log('🚀 ~ fetchStatus ~ amountToPay - 148:', amountToPay);

            if (amountToPay && amountToPay.error) {
                console.log('🚀 ~ fetchStatus ~  if (amountToPay && amountToPay.error):', amountToPay);

                switch (amountToPay.error) {
                    case 'request_processing':
                        break;
                    case 'product_unavailable':
                        processError(OrderStatus.PRODUCT_UNAVAILABLE, 'Product unavailable.The product might no longer be available on Amazon or teh quantity requested is not available.');
                        break;
                    case 'shipping_address_refused':
                        processError(OrderStatus.SHIPPING_ADDRESS_REFUSED, 'Shipping address refused, please try again or contact the support.');
                        break;

                    default:
                        processError(OrderStatus.ERROR, 'Error during the request, please try again or contact the support.');
                        console.log('🚀 ~ file: Order.tsx:246 ~ proceedToPayment ~ amountToPay.error:', amountToPay.error);

                        break;
                }
            } else if (amountToPay && Object.keys(amountToPay).length !== 0 && !amountToPay.error) {
                console.log('🚀 ~ fetchStatus ~ amountToPay: 172', amountToPay);
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
                console.log('🚀 ~ fetchStatus ~ updateDb:', updateDb);

                const hasUpdated = await updateOrder(order.order_id!, updateDb);
                console.log('🚀 ~ proceedToPayment ~ hasUpdated - 195:', hasUpdated);
            } else if (amountToPay && amountToPay.error) {
                switch (amountToPay.error) {
                    case 'insufficient_zma_balance':
                        processError(OrderStatus.INSUFFICIENT_ZMA_BALANCE, 'insufficient_zma_balance');
                        break;
                }
            }
        }
    };

    useEffect(() => {
        const getTicket = async (order_id: string) => {
            let { data: support_tickets, error } = await supabase.from('support_tickets').select('*').eq('order_id', order_id);

            if (error) {
                console.error('Error fetching ticket:', error);
                return;
            }

            console.log('🚀 ~ getTicket ~ support_tickets:', support_tickets);
            setTicket(support_tickets![0]); // Suppongo che support_tickets sia un array
        };

        // Verifica che l'ordine esista e che abbia un order_id valido
        if (order && order.order_id) {
            getTicket(order.order_id); // Passa l'order_id corretto
        }
    }, [order]); // Aggiungi order come dipendenza per eseguire il codice ogni volta che cambia

    const proceedToPayment = async () => {
        setIsLoading(true);
        const products = order.products;

        const hasAlreadySavedPrice = products?.filter(product => product.price);

        if (hasAlreadySavedPrice?.length === products?.length) {
            const encryptedOrderId = encryptData(order.order_id!);
            router.push(`/pay/${encryptedOrderId}/checkout`);
        }
    };
    // const sendTicketToTelegram = (order_id: string | undefined) => {
    //     const message = `order_id=${order_id}`;
    //     const user = `order_id=${session?.address}`;

    //     // Codifica il messaggio in base64
    //     const encodedMessage = Buffer.from(message).toString('base64'); // Corretto: codifica in base64
    //     const encodedUser = Buffer.from(user).toString('base64'); // Corretto: codifica in base64

    //     // Crea l'URL Telegram con il messaggio codificato
    //     const telegramUrl = `https://t.me/SmartDropperSupport_Bot?start=${encodedMessage}&user=${encodedUser}`;

    //     // Apri il link in una nuova scheda
    //     window.open(telegramUrl, '_blank');
    // };
    // const showticket = () => {
    //     setOpenTicketCanvaas(true);
    // };
    const openTicket = async () => {

        const { data, error } = await supabase
            .rpc('create_support_ticket', {
                p_order_id: order.order_id,
                p_user_wallet_address: session?.address
            });

        if (error) {
            console.log('🚀 ~ openTicket ~ error:', error);
            console.log('A ticket for this order already exists or an error occurred!');
            return;
        }

        // Fetch the newly created ticket
        const { data: ticketData, error: ticketError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('order_id', order.order_id)
            .eq('user_wallet_address', session?.address)
            .single();

        if (ticketError) {
            console.log('🚀 ~ openTicket ~ ticketError:', ticketError);
            return;
        }

        console.log('🚀 ~ openTicket ~ ticketData:', ticketData);

        // Update the orders table with the new ticket_id
        const { error: updateError } = await supabase
            .from('orders')
            .update({ ticket_id: ticketData.id }) // Assuming 'id' is the primary key of the ticket
            .eq('id', order.order_id); // Assuming 'id' is the primary key of the orders table

        if (updateError) {
            console.log('🚀 ~ openTicket ~ updateError:', updateError);
            return;
        }

        console.log('🚀 ~ openTicket ~ Ticket ID added to orders:', ticketData.id);
        setTicket(ticketData);
    };


    const renderSwitch = (status: OrderStatus, asin: string, isReturned: boolean) => {
        switch (status) {
            case OrderStatus.ORDER_CONFIRMED:
                return (
                    <button
                        onClick={() => showInfoSwal('We are placing your order on Amazon, please come back later')}
                        className="btn btn-primary col-lg-6 col-md-8 col-sm-12 col-xs-12"
                        style={{ backgroundColor: '#ffd595', color: 'white' }}
                    >
                        Placing order on retailer...
                    </button>
                );
            case OrderStatus.SENT_TO_AMAZON:
                return (
                    <div className="d-flex flex-column  justify-content-center align-items-center mt-5 ">
                        <span className="h2 fw-bold text-center  col-10 col-xl-8" onClick={() => setShowModal({ show: true, type: 'View Status', asin: asin })}>
                            Order Status
                        </span>
                        <StatusSteps asin={asin} amazonStatus={amazonStatus} />
                    </div>
                );
            case OrderStatus.RETURNED:
                if (isReturned) {
                    return (
                        <button
                            onClick={() => showInfoSwal('The refund has been completed')}
                            className="btn btn-success  col-lg-6 col-md-8 col-sm-12 col-xs-12"
                        >
                            Product returned
                        </button>
                    );
                } else {
                    return (
                        <button
                            className="btn btn-primary col-lg-6 col-md-8 col-sm-12 col-xs-12"
                            onClick={() => setShowModal({ show: true, type: 'View Status', asin: asin })}
                        >
                            View Status
                        </button>
                    );
                }
            case OrderStatus.RETURNED_TO_AMAZON:
                if (isReturned) {
                    return (
                        <button className="btn btn-secondary col-10 col-xl-8 " onClick={() => setShowModal({ show: true, type: 'View Return Status' })}>
                            View Return Status
                        </button>
                    );
                } else {
                    return (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-primary col-10 col-xl-8" onClick={() => setShowModal({ show: true, type: 'View Status', asin: asin })}>
                                View Status
                            </button>
                        </div>
                    );
                }
            case OrderStatus.CANCELED:
                return (
                    <button onClick={() => showInfoSwal('Your order have been canceled')} className="btn btn-danger col-lg-6 col-md-8 col-sm-12 col-xs-12">
                        Order canceled
                    </button>
                );

            // case OrderStatus.SHIPPING_ADDRESS_REFUSED:
            //     return (
            //         <>
            //             <button
            //                 className="btn btn-secondary m-1 col-10 col-xl-8"
            //                 onClick={() => showInfoSwal('Your shipping address has been refused, please create a new order')}
            //             >
            //                 <WarningAmberIcon /> <span className="text-danger m-1 d-flex align-items-center">Shipping address refused</span>
            //             </button>

            //         </>
            //     );
            case OrderStatus.PRODUCT_UNAVAILABLE:
                return (
                    <a
                        href="#"
                        onClick={() => showInfoSwal('One ore more products in your order are not available, please create a new one')}
                        className=" text-danger col-12 text-center  link-danger"
                    >
                        Product unavailable
                    </a>
                );
        }
    };

    useEffect(() => {
        let date = new Date();
        let orderDate = new Date(order.created_at!);
        let diff = Math.abs(Number(date) - Number(orderDate));
        setIsThirtyPassed(diff / 60000 / 60 / 24);
    }, []);

    useEffect(() => {
        if (order && order.order_id) {
            fetchOrderStatus();
        }
    }, [order]);

    return (
        <>
            {isLoading && (
                <ModalOverlay show={isLoading}>
                    <Loading loadingText="Checking tax..." />
                </ModalOverlay>
            )}
            <div className="order-details">
                <Image src="/icons/amazon-avatar.png" height={100} width={100} alt="avatar" className="mb-5" />

                <div className="d-lg-flex justify-content-center align-items-center mb-3">
                    <div className="order-info">
                        <h5 className="m-0">
                            <strong>Order #{order.order_id}</strong>
                        </h5>
                        <span className="d-block mt-1">{new Date(order.created_at!).toLocaleString()}</span>
                    </div>
                </div>

                {orderItems?.map((product, i) => {
                    return (
                        <div key={`${order.order_id}-${i}-order`} className="mt-4 mb-5">
                            <OrderProduct product={product} order={order} />
                            <div className="my-5 order-buttons mt-3 text-end d-flex justify-content-center">
                                {order.status && renderSwitch(order.status, product.asin, true)}
                            </div>
                        </div>
                    );
                })}
                {returnItems?.map((product, i) => {
                    return (
                        <div key={`${order.order_id}-${i}-return`} className="mt-4 mb-5">
                            <OrderProduct product={product} />

                            <div className="order-buttons mt-3 text-end d-flex justify-content-center">
                                {order.status && renderSwitch(order.status, product.asin, true)}
                            </div>
                        </div>
                    );
                })}

                {order.status === OrderStatus.SHIPPING_ADDRESS_REFUSED && (
                    <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center">
                        <div className=" col-10 col-xl-8 text-danger text-center  d-flex justify-content-center flex-column align-items-center">
                            <b>SHIPPING ADDRESS REFUSED  <br />Please, replace order again.</b> <br />

                        </div>
                    </div>
                )}
                {order.status === OrderStatus.WAITING_TAX && (
                    <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center d-flex flex-column align-items-center">
                        <span className="  col-10 col-xl-8 text-danger text-primary text-center my-1">
                            <b>Waiting for taxes... </b> <br />
                        </span>
                        <button
                            className="btn btn-success col-10 col-xl-8 my-1"
                            disabled={true}

                            onClick={() => {
                                Swal.fire({
                                    title: 'We are retrieving the total order amount from the Amazon Provider. This process can take up to 10 minutes, please wait and try again.',
                                    icon: 'info',
                                });
                            }}
                            style={{ backgroundColor: '#83ce89' }}
                        >
                            Confirm order
                        </button>
                        <div className="d-flex col-10 col-xl-8">
                            <span className="disclaimer alert alert-warning my-1 text-center">
                                {' '}
                                <b>* If you don&apos;t see any update after 1 hour please contact support on Telegram.</b>{' '}
                            </span>

                        </div>
                    </div>
                )}
                {order.status === OrderStatus.WAITING_CONFIRMATION && (
                    <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center">
                        <button className="btn btn-success col-10 col-xl-8" disabled={taxRequestId === undefined} onClick={proceedToPayment}>
                            Confirm order
                        </button>
                    </div>
                )}

                {order && OrderStatus && order.status === OrderStatus.ERROR && !ticket && (
                    <div className=" d-flex justify-content-center flex-column align-items-center">
                        <span className="my-2 col-10 col-xl-8 fw-bold">Error during the request, please try again or contact the support</span>
                        <button className="btn btn-dark d-flex col-10 col-xl-8 " onClick={openTicket}>
                            Open a support request
                        </button>
                    </div>
                )}
            </div>

            {ticket && (
                <div className="">
                    <b>
                        <i>Case:</i>
                    </b>
                    <i> {ticket.id}</i>
                </div>
            )}
            <hr />
            {isMounted && ticket && ticket.order_id === order.order_id ? (
                <Suspense>
                    <TicketMessagebox show={OpenTicketCanvaas} setShow={setOpenTicketCanvaas} orderId={order.order_id!} ticket={ticket}>
                        <MessageResult orderId={order.order_id!} ticket={ticket} />
                    </TicketMessagebox>
                </Suspense>
            ) : (
                <div className=" d-flex justify-content-center flex-column align-items-center"></div>
            )}
            {/* {isMounted && order.status === OrderStatus.SHIPPING_ADDRESS_REFUSED ? (
                <div>
                    <ChangeShippingInfo order={order} />
                    <button className="btn btn-dark d-flex col-12 " onClick={ReplaceOrder} disabled={replacingOrder}>
                        Replace Order
                    </button>
                </div>
            ) : (
                <div className=" d-flex justify-content-center flex-column align-items-center col-12"></div>
            )} */}
            {/* {replacingOrder && (
                <ModalOverlay show={isLoading}>
                    <Loading loadingText="Replacing order...." />
                </ModalOverlay>
            )} */}
        </>
    );
};

export default Order;