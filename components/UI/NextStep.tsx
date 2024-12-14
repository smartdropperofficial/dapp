import React, { useContext, useRef, useState, useEffect } from 'react';
import { OrderContext } from '../../store/order-context';
import Swal from 'sweetalert2';
import Loading from './Loading';
import ModalOverlay from './ModalOverlay';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSignMessage } from 'wagmi';
import { verifyMessage } from 'ethers/lib/utils.js';
import { createOrder, createOrderOnAmazon, updateOrder } from '../controllers/OrderController';
import { OrderStatus } from '../../types/Order';
import { OrderSB } from '../../types/OrderSB';
import orderId from 'order-id';
import { encryptData } from '../../utils/utils';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../types/SessionExt';
import { SendEmailOrderReceived } from '../controllers/EmailController';
import { ConfigContext } from '@/store/config-context';
import { useOrder } from '../controllers/useOrder';
import { SubscriptionContext } from '@/store/subscription-context';
// import { useOrder } from '@/components/controllers/useOrder';
const NextStep: React.FC = () => {
    const orderCtx = useContext(OrderContext);
    const configCtx = useContext(ConfigContext);
    const router = useRouter();
    const { data: session } = useSession() as { data: SessionExt | null };
    const config_context = useContext(ConfigContext);

    const signerAddress = useRef<string>('');
    const currentOrderId = useRef<string>('');
    const { createPreOrder } = useOrder();
    const { canShop } = useContext(SubscriptionContext);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [go, setGo] = useState<boolean>(true);

    useEffect(() => {
        console.log("🚀 ~ useEffect ~ canShop:", canShop)
    }, [canShop])

    const nextStepHandler = async () => {
        switch (orderCtx.currentStep) {
            case 1:
                if (orderCtx.zone === '') {
                    return Swal.fire({
                        title: 'Please select a zone to continue.',
                        icon: 'error',
                    });
                } else {
                    orderCtx.stepsHandler('increase');
                    window.scrollTo(0, 0);
                }
                break;
            case 2:
                if (orderCtx.retailer === '') {
                    return Swal.fire({
                        title: 'Please select a retailer to continue.',
                        icon: 'error',
                    });
                } else {
                    orderCtx.stepsHandler('increase');
                    window.scrollTo(0, 0);
                }
                break;
            case 3:
                if (orderCtx.items.length < 1 || orderCtx.items[0].url === '') {
                    return Swal.fire({
                        title: 'Insert at least 1 item from Amazon to continue.',
                        icon: 'error',
                    });
                } else if (orderCtx.basketTotal() < 25.01) {
                    return Swal.fire({
                        title: 'The total value of the items in the basket must exceed $25.00',
                        icon: 'error',
                    });
                } else {
                    orderCtx.stepsHandler('increase');
                    window.scrollTo(0, 0);
                }
                break;
            case 4:
                if (!hasNull(orderCtx.shippingInfo)) {
                    orderCtx.stepsHandler('increase');
                    window.scrollTo(0, 0);
                } else {
                    if (!orderCtx.showErrors) {
                        orderCtx.showErrorsToggle();
                        window.scrollTo(0, 0);
                    }
                }
                break;
            case 5:
                if (orderCtx.termsConditions) {
                    orderCtx.stepsHandler('increase');
                    window.scrollTo(0, 0);
                } else {
                    Swal.fire({ icon: 'warning', title: 'You must accept all the terms to continue.' });

                    if (!orderCtx.showErrors) {
                        orderCtx.showErrorsToggle();
                        window.scrollTo(0, 0);
                    }
                }
                break;
            // case 6:
            //     setIsLoading(true);
            //     if (orderCtx.items.length < 1) {
            //         orderCtx.stepsHandler('decrease');

            //         setIsLoading(false);
            //         return;
            //     }
            //     try {
            //         await performPreOrderCreation();
            //         // await signMessageAsync({
            //         //     message:
            //         //         'Signing this message you will accept Terms and Conditions.\nPlease wait around 10 minutes so we can calculate the best shipping offer and the correct amount of TAX.',
            //         // });
            //     } catch {
            //         setIsLoading(false);

            //         Swal.fire({
            //             title: 'Please connect your wallet before continue with the next step.',
            //             icon: 'info',
            //         });
            //     }
            //     break;
            default:
                break;
        }
    };

    const hasNull = (target: any) => {
        for (let member in target) {
            if ((target[member] === null || target[member] === '') && member !== 'addressLine2') return true;
        }
        return false;
    };
    useEffect(() => {
        if (session) {
            setGo(!session?.verified === false || session?.email === null || session?.address === null);
        }
    }, [session]);

    return (
        <>
            <div className="d-flex justify-content-between text-end  d-flex align-items-center">
                <button
                    className={`btn text-black ${orderCtx.currentStep === 1 && 'invisible'} px-0`}
                    disabled={orderCtx.currentStep === 1}
                    onClick={() => {
                        orderCtx.stepsHandler('decrease');
                        window.scrollTo(0, 0);
                    }}
                >
                    <Image src={'/assets/back.png'} height={50} width={50} alt="SmartShopper Back Icon" />
                    <strong className="ms-3">BACK</strong>
                </button>
                <button
                    className={`btn text-black ${orderCtx.currentStep === 6 && 'invisible'} d-flex align-items-center px-0`}
                    disabled={orderCtx.currentStep === 6 || !go || (orderCtx.currentStep === 3 && canShop === false)}
                    onClick={nextStepHandler}
                >
                    <strong className="me-3">NEXT </strong>{' '}
                    <Image src={'/assets/back.png'} className="btn-next" height={50} width={50} alt="SmartShopper Next Icon" />
                </button>
                <ModalOverlay show={isLoading}>
                    <Loading loadingText={'Loading'} />
                </ModalOverlay>
            </div>
        </>
    );
};

export default NextStep;
