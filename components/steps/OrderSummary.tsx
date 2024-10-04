import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';
import { OrderContext } from '../../store/order-context';
import ItemCard from '../UI/ItemCard';
import { Alert, AlertTitle, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { getBasketOnDB } from '@/utils/utils';
import { useAccount } from 'wagmi';
import Swal from 'sweetalert2';
import { ConfigContext } from '@/store/config-context';

const OrderSummary: React.FC = () => {
    const { address } = useAccount();
    const configContext = useContext(ConfigContext);

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [amountToPay, setAmountToPay] = useState<number>();
    const basketTotalFromDb = useCallback(async (): Promise<number> => {
        if (session?.address) {
            const basket = await getBasketOnDB(session?.address);
            return basket.reduce((acc, item) => acc + item.price! * item.quantity, 0);
        }
        return 0;
    }, [session?.address]);
    const ctx = useContext(OrderContext);
    const openPaymentDepayWidgetHandler = async () => {
        const DePayWidgets = (await import('@depay/widgets')).default;
        if (!address) {
            Swal.fire({
                title: 'Please connect your wallet to proceed',
                icon: 'error',
            });
            return;
        } else {
            const acceptobj = {
                blockchain: 'polygon',
                amount: ctx.basketTotal().toFixed(2),
                token: configContext.config?.coin_contract as `0x${string}`,
                receiver: configContext.config?.order_owner as `0x${string}`,
                //    fee: {
                //        amount: fees!.toFixed(2),
                //        receiver: process.env.NEXT_PUBLIC_SMART_CONTRACT_COIN as `0x${string}`,
                //    },
            };
            console.log(acceptobj);

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
                succeeded: (transaction: any) => {
                    // setPaymentTx(transaction.id);
                },
                failed: (transaction: any) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact the support.',
                        icon: 'error',
                    });
                    console.error('Payment failed:', transaction);
                },
                error: (error: any) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact the support.',
                        icon: 'error',
                    });
                    console.error('Payment error:', error);
                },
            });
            // DePayWidgets.Payment({
            //      integration: "f3bf2aa3-5731-484e-9bb3-5ede215f3fe0",
            //      payload: {
            //           orderid: orderId,
            //      },
            // });
        }
    };

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
                <div className="my-4 mx-3 text-end">
                    <h3>
                        {' '}
                        <b>{'$' + ctx.basketTotal().toFixed(2)}</b>
                        {/* <b>
                            {'$' +
                                ctx.basketTotalFromDb().then(total => {
                                    return total;
                                })}
                        </b>{' '} */}
                    </h3>{' '}
                </div>
                {/* <div className="subtotal d-flex justify-content-between mt-3">
          
          ong>SUBTOTAL:</strong>
          
          
          ong>
          
          rong>
          
           */}
            </section>
            <section id="pre-order-checkout">
                <div className="">
                    <Alert severity="warning" className="col-12 d-flex flex-column justify-content-center rounded-3 mt-5">
                        <AlertTitle>
                            **Pre-order Payment Notice**: This is a <b>pre-order payment</b>, where you will only be charged for the price of the merchandise,
                            excluding <b>shipping</b> and <b>state taxes</b> . Once the payment is completed,{' '}
                            <u>we will send you an email with the details of the taxes required to finalize the shipment</u> .
                            <div className="mt-5">
                                <p className="disclaimer">
                                    Note that in the United States, purchases on Amazon are subject to state and local taxes in most states. The amount of tax
                                    varies depending on the state, city, and sometimes the county where the buyer is located.
                                </p>
                                <p className="disclaimer text-start" style={{ backgroundColor: '' }}>
                                    (To learn more about US State Sales Tax, please check &nbsp;
                                    <a className="" href="https://www.amazon.com/gp/help/customer/display.html?nodeId=202036190" target="_black">
                                        Amazon page
                                    </a>
                                    ){/* <InfoIcon style={{ fontSize: '14px' }} className="mx-2"></InfoIcon> */}
                                </p>
                            </div>
                        </AlertTitle>
                    </Alert>
                </div>
                <div id="pre-order-payment-button" className="mt-5 d-flex flex-column align-items-center">
                    <h4>
                        {' '}
                        <b> Pay pre-order</b>
                    </h4>
                    <button
                        disabled={ctx.basketTotal() === 0}
                        className={`btn form-control  mt-2 col-12 col-xl-10 ${ctx.basketTotal() === 0 ? 'btn-disabled' : 'btn-success'}`}
                        onClick={openPaymentDepayWidgetHandler}
                    >
                        ${Number(ctx.basketTotal().toFixed(2))}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default OrderSummary;
