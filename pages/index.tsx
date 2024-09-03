import { useContext, useEffect } from 'react';
import Card from '../components/UI/Card';
import AddProducts from '../components/steps/AddProducts';
import NextStep from '../components/UI/NextStep';
import { OrderContext } from '../store/order-context';
import ShippingInfo from '../components/steps/ShippingInfo';
import OrderSteps from '../components/steps/OrderSteps';
import Image from 'next/image';
import OrderSummary from '../components/steps/OrderSummary';
import Head from 'next/head';
import RetailerPicker from '../components/steps/ShopPicker';
import ZonePicker from '../components/steps/ZonePicker';
import { RETAILERS } from '../utils/constants';
import EbayImg from '../public/assets/image.png';
import AmazonImg from '../public/assets/amazon-logo.png';
import { ConfigContext } from '@/store/config-context';
import Basket from '@/components/orders/Basket';
import { useAccount, useDisconnect } from 'wagmi';
import router from 'next/router';
import { GetServerSideProps } from 'next';
// import { withAuth } from '@/withAuth';

export default function Home() {
    const { disconnect } = useDisconnect();

    const configCtx = useContext(ConfigContext);

    const { currentStep: step } = useContext(OrderContext);
    const { address } = useAccount();
    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        }
    }, [address]);
    useEffect(() => {
        const middleOfPage = window.innerHeight / 2;
        window.scrollTo({ top: middleOfPage, behavior: 'smooth' });
    }, []);
    const stepContent = () => {
        switch (step) {
            case 1:
                return <ZonePicker />;
            case 2:
                return <RetailerPicker />;
            case 3:
                return <AddProducts />;
            case 4:
                return <ShippingInfo />;
            case 5:
                return <OrderSummary />;
            default:
                console.log(step);
        }
    };
    const SetDescription = () => {
        const retailer = useContext(OrderContext).retailer;
        if (retailer === RETAILERS.AMAZON) {
            return (
                <div className="card-title text-center">
                    <Image src={AmazonImg} alt="SmartShopper Background" width={200} height={100} />
                    <Image src="/icons/usa.png" alt="usa icon " width={40} height={40} />
                    <h1>
                        Order on <b> Amazon US</b> using Crypto with just a few clicks.
                    </h1>
                </div>
            );
        } else if (retailer === RETAILERS.EBAY) {
            return (
                <div className="card-title text-center">
                    <Image src={EbayImg} alt="SmartShopper Background" width={200} height={100} />
                    <Image src="/icons/usa.png" alt="usa icon " width={40} height={40} />
                    <h1>
                        Order on <b> Ebay </b> using Crypto with just a few clicks.
                    </h1>
                </div>
            );
        }
    };


    return (
        <>
            <Head>
                <meta property="og:title" content="SmartShopper | Shop on Amazon using Crypto" />
                <meta
                    property="og:description"
                    content="Smartshopper is the first decentralized platform that allows users to buy on Amazon by just using their DeFi Wallet, like Metamask or TrustWallet."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://app.smartshopperpay.com/" />
                <meta property="og:site_name" content="SmartShopper" />

                <link rel="canonical" href="https://app.smartshopperpay.com/" />

                <meta property="og:image" content="/assets/meta/index.png" />
                <meta property="og:image:height" content="1000" />
                <meta property="og:image:width" content="1000" />

                <meta property="og:image" content="/assets/meta/indexmobile.png" />
                <meta property="og:image:height" content="200" />
                <meta property="og:image:width" content="200" />

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@smartshopper" />
                <meta name="twitter:title" content="SmartShopper | Shop on Amazon using Crypto" />
                <meta
                    name="twitter:description"
                    content="Smartshopper is the first decentralized platform that allows users to buy on Amazon by just using their DeFi Wallet, like Metamask or TrustWallet."
                />
                <meta name="twitter:creator" content="@deforceagency" />
                <meta name="twitter:image" content="/assets/meta/index.png" />

                <title>SmartShopper | Shop on Amazon using Crypto</title>
                <meta
                    name="description"
                    content="Smartshopper is the first decentralized platform that allows users to buy on Amazon by just using their DeFi Wallet, like Metamask or TrustWallet."
                />
            </Head>

            {step === 3 ?
                <div className="container h-100 d-flex justify-content-center align-items-start flex-column">


                    <div className="row w-100 justify-content-lg-start justify-content-center">
                        <div className='d-flex flex-column flex-lg-row'>
                            <section className="col-md-10 col-lg-7 col-12 p-0 py-lg-3 mx-lg-3 mb-5 ">
                                <Card>
                                    {SetDescription()}
                                    <OrderSteps currentStep={step} />
                                    {stepContent()}
                                    {/* <NextStep /> */}
                                </Card>
                            </section>
                            <section id='basket' className="col-md-10 col-lg-6 col-12  p-0 py-lg-3">
                                <Card>
                                    <Basket />
                                    <NextStep />
                                </Card>
                            </section>
                        </div>

                    </div>
                    {/* <div className="row w-100 justify-content-lg-start justify-content-center">
                        <div className='d-flex flex-column flex-lg-row'>
                            <section className="col-md-10 col-lg-7 col-12 p-0 py-lg-0 mx-lg-3 mb-0 ">
                                <div className='mt-3 p-0'>
                                    <div className='card p-2 px-5'>
                                        <NextStep />
                                    </div>
                                </div>
                            </section>

                        </div>

                    </div> */}
                </div> :
                <div className="container h-100 d-flex justify-content-center align-items-center">
                    <div className="row w-100 justify-content-center">
                        <div className="col-md-10 col-lg-8 p-0 py-1">
                            {/* <div className='card p-2 px-5'>
                            </div> */}
                        </div>
                        <div className="col-md-10 col-lg-8 p-0 py-lg-3">
                            <Card>
                                {SetDescription()}
                                <OrderSteps currentStep={step} />
                                {stepContent()}
                                <NextStep />

                            </Card>

                        </div>
                        {/* <div className="col-md-10 col-lg-8 p-0 py-lg-1">
                            <Card>
                                <NextStep />
                            </Card>
                        </div> */}

                    </div>

                </div>}

        </>
    );
}
// export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
//     // Logica aggiuntiva per la tua pagina
//     return {
//         props: {
//             // Props aggiuntive per il tuo componente
//         },
//     };
// });