import Image from 'react-bootstrap/Image';

import Link from 'next/link';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { OrderContext } from '../../store/order-context';
import ItemCard from '../UI/ItemCard';
import Alert from 'react-bootstrap/Alert';

import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { encryptData, getBasketOnDB } from '@/utils/utils';
import { useAccount, useWaitForTransaction } from 'wagmi';
import Swal from 'sweetalert2';
import { ConfigContext } from '@/store/config-context';
import useOrderManagement from '@/hooks/Contracts/Order/customHooks/useOrder';
import Skeleton from 'react-loading-skeleton';
import { useOrder } from '../controllers/useOrder';
import { updateOrder } from '../controllers/OrderController';
import { OrderSB } from '@/types/OrderSB';
import { useRouter } from "next/router"
import ModalOverlay from '../UI/ModalOverlay';
import Loading from '../UI/Loading';

const OrderSummary: React.FC = () => {
    const router = useRouter();
    const succeededCalled = useRef(false);
    const isCreatingOrder = useRef(false);
    const [paymentTx, setPaymentTx] = useState<`0x${string}`>();
    const [orderIsProcessing, setOrderIsProcessing] = useState(false);
    const [orderHasBeenProcessed, setOrderHasBeenProcessed] = useState(false);
    const { address } = useAccount();
    const config_context = useContext(ConfigContext);
    const order_context = useContext(OrderContext);
    const { getExchangeTax } = useOrderManagement();
    const [slippage, setSlippage] = useState<number>();
    const [exchangeFees, setExchangesFees] = useState<number>();
    const [totalToPay, setTotalToPay] = useState<number>();
    const { createPreOrder } = useOrder();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const basketTotalFromDb = useCallback(async (): Promise<number> => {
        if (session?.address) {
            const basket = await getBasketOnDB(session?.address);
            return basket.reduce((acc, item) => acc + item.price! * item.quantity, 0);
        }
        return 0;
    }, [session?.address]);
    const ctx = useContext(OrderContext);
    const { isLoading: loadingPaymentTx } = useWaitForTransaction({
        chainId: 137,
        confirmations: 5,
        hash: paymentTx,
        enabled: !!paymentTx && !isCreatingOrder.current,
        onSuccess() {
            logWithMilliseconds('loadingPaymentTx onSuccess ');
            if (!isCreatingOrder.current) {
                isCreatingOrder.current = true;
                performPreOrderCreation();
            }
        },
    });
    function logWithMilliseconds(message: string) {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
            now.getHours()
        ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(
            3,
            '0'
        )}`;
        console.log(`[${formattedDate}] ${message}`);
    }

    const openPaymentDepayWidgetHandler = async () => {
        if (!address) {
            Swal.fire({
                title: 'Please connect your wallet to proceed',
                icon: 'error',
            });
            return;
        } else {
            const acceptobj = {
                blockchain: 'polygon',
                amount: Number(totalToPay?.toFixed(2)),
                token:
                    process.env.NODE_ENV === 'development'
                        ? (config_context.config?.coin_contract as `0x${string}`)
                        : '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' as `0x${string}`,
                receiver:
                    process.env.NODE_ENV === 'development'
                        ? (config_context.config?.order_owner as `0x${string}`)
                        : '0x4790a1d817999dD302F4E58fe4663e7ee8934F90' as `0x${string}`,
            };

            console.log(acceptobj);

            // Utilizza direttamente DePayWidgets per avviare il pagamento
            await DePayWidgets.Payment({
                accept: [acceptobj],
                currency: 'USD',

                style: {
                    colors: {
                        primary: '#ff9900',
                        text: '#000',
                        buttonText: '#fff',
                        icons: '#ff9900',
                    },
                    fontFamily: '"Montserrat", sans-serif!important',
                    css: `
                @import url("https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap");
                .ReactDialogBackground {
                  background: rgba(0,0,0,0.8);
                }
              `,
                },
                before: async () => {
                    const amountFromDb = await basketTotalFromDb();

                    if (amountFromDb.toFixed(2) !== ctx.basketTotal().toFixed(2)) {
                        console.error(
                            `Depay - Pre-Order Payment - before : Amount expected:(${amountFromDb.toFixed(
                                2
                            )}) but the amount into the Widget has a different amount. acceptobj is (${acceptobj.amount}) `
                        );
                        Swal.fire({
                            title: 'Error during the payment.',
                            icon: 'error',
                            text: 'Amount expected is different from the amount into the widget.',
                        });
                        return false;
                    }
                },
                succeeded: (transaction) => {
                    if (!succeededCalled.current) {
                        config_context.setIsLoading(true);
                        succeededCalled.current = true;
                        console.log('succeeded called with transaction.id:', transaction.id);
                        setPaymentTx(transaction.id);
                        logWithMilliseconds('succeeded setPaymentTx ');
                    } else {
                        console.warn('succeeded callback called multiple times. Ignoring subsequent calls.');
                    }
                },
                failed: (transaction) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact support.',
                        icon: 'error',
                    });
                    console.error('Payment failed:', transaction);
                },
                error: (error) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact support.',
                        icon: 'error',
                    });
                    console.error('Payment error:', error);
                },
            });
        }
    };


    const performPreOrderCreation = async () => {
        if (!orderIsProcessing && !orderHasBeenProcessed) {
            if (paymentTx && /^0x[a-fA-F0-9]{64}$/.test(paymentTx)) {
                setOrderIsProcessing(true);
                try {
                    const hasCreated = await createPreOrder();
                    console.log('🚀 ~ performPreOrderCreation ~ hasCreated.data.order_id:', hasCreated.data.order_id);
                    console.log('🚀 ~ placeOrderOnAmazon ~ hasCreated:', hasCreated);

                    if (hasCreated.created) {
                        const updateDb: OrderSB = {
                            payment_tx: paymentTx,
                            pre_order_amount: Number(ctx.basketTotal().toFixed(2)),
                        };
                        const hasUpdated = await updateOrder(hasCreated.data.order_id, updateDb);

                        if (hasUpdated) {
                            if (process.env.NODE_ENV === 'production') {
                                order_context.deleteAllItems();
                            }
                            const encryptedOrderId = encryptData(hasCreated.data.order_id);
                            setOrderIsProcessing(false);
                            setOrderHasBeenProcessed(true);

                            router.push(`/order/${encryptedOrderId}/preorder-thank-you`);
                        }
                    } else {
                        config_context.setIsLoading(false);

                        Swal.fire({
                            title: 'Order creation failed! Please, contact support on Telegram Channel',
                            text: 'We received your payment but there were some issues creating the order on the blockchain.',
                            icon: 'error',
                        });

                        return false;
                    }
                } catch (error) {
                    config_context.setIsLoading(false);
                }
            }
        }
    };

    useEffect(() => {
        if (getExchangeTax) {
            getExchangeTax().then(data => {
                console.log('🚀 ~ getExchangeTax ~ data:', data);
                setSlippage(data);
            });
        }
    }, [getExchangeTax]);
    useEffect(() => {
        if (ctx && slippage) {
            setExchangesFees((ctx.basketTotal() / 100) * slippage);
        }
    }, [slippage, ctx]);
    useEffect(() => {
        if (ctx && slippage) {
            setTotalToPay(ctx.basketTotal() + exchangeFees!);
        }
    }, [exchangeFees, ctx]);

    return (
        <div>
            <section id="pay" className="mt-4">
                <h5>
                    <strong>1. Shipping Info</strong>
                </h5>
                <div className="row mt-4 mb-5">
                    <div className="col-md-6">
                        <p>
                            <strong>Email:</strong> {ctx.shippingInfo.email}
                        </p>
                        <p>
                            <strong>First Name:</strong> {ctx.shippingInfo.firstName}
                        </p>
                        <p>
                            <strong>Last Name:</strong> {ctx.shippingInfo.lastName}
                        </p>
                        <p>
                            <strong>Address Line:</strong> {ctx.shippingInfo.addressLine1}
                        </p>
                    </div>
                    <div className="col-md-6">
                        <p>
                            <strong>Zip Code:</strong> {ctx.shippingInfo.zipCode}
                        </p>
                        <p>
                            <strong>City:</strong> {ctx.shippingInfo.city}
                        </p>
                        <p>
                            <strong>State:</strong> {ctx.shippingInfo.state}
                        </p>
                        <p>
                            <strong>Phone Number:</strong> {ctx.shippingInfo.phoneNumber}
                        </p>
                    </div>
                </div>
                <h5 className="mb-4">
                    <strong>2. Order Items</strong>
                </h5>
                <div className="row">
                    {ctx.items.map(el => {
                        return (
                            <div className="mb-3" key={el.id}>
                                <ItemCard>
                                    <div className="row align-items-center justify-content-sm-start justify-content-start">
                                        <div className="col-3 col-sm-2 ">
                                            <img
                                                src={el.image}
                                                alt={el.title}
                                                style={{ borderRadius: '5%', boxShadow: '0px 20px 39px -9px rgba(0,0,0,0.1)' }}
                                                className="img-thumbnail img-fluid"
                                            />
                                        </div>
                                        <div className="col-10">
                                            <div className="item-info my-3 ">
                                                <p>{el.title}</p>
                                                <Link href={el.url} target="_blank">
                                                    Open on Amazon
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="row d-flex mt-3 col-12 ">
                                            <br />
                                            <div className="col-12  position-relative d-flex justify-content-between  ">
                                                <div>
                                                    <b>Q.ty:</b>
                                                    <span className="font-weight-bold bg-white py-2 px-4  flex-column m-2 ">{el.quantity}</span>
                                                </div>
                                                <br />
                                                <span>
                                                    <b>Total:</b> {el.symbol} {(el.price! * el.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </ItemCard>
                            </div>
                        );
                    })}
                </div>
                <div className="my-4 mx-3 text-end ">
                    <div className="d-flex justify-content-between col-12">
                        <div>
                            <b>Crypto/Fiat exchange fees: </b>
                            {/* <Image src="/icons/1inch.png" alt="" height={20} style={{ aspectRatio: 'auto' }} /> */}
                        </div>
                        <p className="col-2 ">${exchangeFees ? exchangeFees?.toFixed(2) : <Skeleton height={20} count={1} style={{ width: '50px' }} />}</p>
                    </div>
                    <h3 className="d-flex justify-content-between col-12">
                        <b>Total Basket: </b>
                        <b>{'$' + ctx.basketTotal().toFixed(2)}</b>
                    </h3>{' '}
                </div>
                {/* <div className="subtotal d-flex justify-content-between mt-3">
          
          ong>SUBTOTAL:</strong>
          
          
          ong>
          
          rong>
          
           */}
            </section>
            <section id="pre-order-checkout">
                <div className="mt-5">
                    <Alert variant="warning">
                        <Alert.Heading> Pre-order Payment Notice</Alert.Heading>
                        <p>
                            Smart Dropper will start the <u>pre-order process. </u> &nbsp; It means that you will only be charged for the{' '}
                            <b>price of the merchandise</b>, excluding
                            <b> Shipping*</b> and <b>Local taxes**</b>.&nbsp; Once the payment is confirmed on Blockchain, our system will start the process of
                            tax calculation. <br />
                            <span>We will send you an email with the details of the taxes required to finalize the shipment</span>
                            <u> (it could take few hours)</u>
                        </p>
                    </Alert>
                </div>

                <div id="pre-order-payment-button" className="mt-5 d-flex flex-column align-items-center col-12">
                    <h4>
                        {' '}
                        <b> Pay pre-order</b>
                        <br />
                    </h4>
                    {totalToPay !== undefined && totalToPay > 0 ? (
                        <button
                            disabled={ctx.basketTotal() === 0}
                            className={`btn form-control  mt-2 col-12 col-xl-10 ${ctx.basketTotal() === 0 ? 'btn-disabled' : 'btn-success'}`}
                            onClick={openPaymentDepayWidgetHandler}
                        >
                            ${Number(totalToPay?.toFixed(2))}
                        </button>
                    ) : (
                        <div className="col-6">
                            <Skeleton height={20} count={2} />
                        </div>
                    )}

                    <div className="col-6"></div>
                </div>
            </section>
            <ModalOverlay show={config_context.isLoading}>
                <Loading />
            </ModalOverlay>
        </div>
    );
};

export default OrderSummary;
