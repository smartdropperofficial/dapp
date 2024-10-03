import Input from '../UI/Input';
import { useContext, useState, useEffect } from 'react';
import { OrderContext } from '../../store/order-context';
import { SubscriptionContext } from '../../store/subscription-context';
import { ProductInfo } from '../../types/Product';
import Swal from 'sweetalert2';
import ModalOverlay from '../UI/ModalOverlay';
import Loading from '../UI/Loading';
import Link from 'next/link';
import ItemCard from '../UI/ItemCard';
import Image from 'next/image';
import { BuddyProductInfo } from '../../types/BuddyProduct';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { red } from '@mui/material/colors';
import { Alert, AlertTitle } from '@mui/material';
import { ProductRainforest, Price2 } from '../../types/Rainforest';
import Basket from '../orders/Basket';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../types/SessionExt';
import { updateBasket } from '../controllers/OrderController';
import { Content } from '../../types/scraperTypes/oxylabs';
import { RainforestData } from '../../types/scraperTypes/Rainforest';
import Card from '../UI/Card';

const AddProducts = () => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const orderContext = useContext(OrderContext);
    const subContext = useContext(SubscriptionContext);

    const [link, setLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getAsin = (): string | null => {
        const parsedAsin = link.match(/(?:[\/dp\/]|$)([A-Z0-9]{10})/);

        if (parsedAsin) {
            return parsedAsin[1];
        } else {
            return null;
        }
    };
    const CheckIsMinified = (): boolean => {
        var isPermaLink = /^https?:\/\/([a-zA-Z\d-]+\.){0,}(amzn|a)\.(to|eu|co)\//i.test(link);
        return isPermaLink;
    };
    useEffect(() => {
        const middleOfPage = window.innerHeight / 5;
        window.scrollTo({ top: middleOfPage, behavior: 'smooth' });
    }, []);
    const addProduct = async () => {
        if (amountLeft() === '$0.00') {
            Swal.fire({
                title: 'You have reached your montly shop limit, please upgrade your subscription',
                icon: 'error',
            });
            return;
        }

        if (CheckIsMinified()) {
            Swal.fire({
                title: 'This is a link from Amazon<b> Mobile App</b>!',
                html: `Please, open it on the Browser, <b> copy the "Link Address" from there</b>, and paste here! <br><br> <br> <b> Would you like to open it on the borswer?</b>  <br> <br>
         `,
                icon: 'warning',
                showDenyButton: true,
                denyButtonText: `No`,
                denyButtonColor: 'bg-danger',
                showConfirmButton: true,
                confirmButtonText: 'Yes',
                confirmButtonColor: 'bg-black',
            }).then(result => {
                if (result.isConfirmed) {
                    const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
                    if (newWindow) newWindow.opener = null;
                } else if (result.isDenied) {
                    return;
                }
            });
            return;
        } else {
            setIsLoading(true);
            try {
                if (link) {
                    const isDotCom = link.match(/\.\w*\b/g)?.[1];
                    if (isDotCom === '.com') {
                        const asin = getAsin();
                        let productInfo: BuddyProductInfo | RainforestData | Content;
                        let response;
                        let resp;
                        if (asin) {
                            response = await fetch(`/api/scraper?${new URLSearchParams({ asin: asin })}`);
                            if (response.status === 200) {
                                try {
                                    resp = await response?.json();
                                    // console.log("🚀 ~ file: AddProducts.tsx:96 ~ addProduct ~ resp:", resp)
                                    // console.log("🚀 ~ file: AddProducts.tsx:97 ~ addProduct ~ resp.data.scraper:", resp.scraper)
                                    orderContext.updateScraper(resp.scraper);
                                    switch (resp.scraper) {
                                        case 'LIBRARY':
                                            // console.log("🚀 ~ file: AddProducts.tsx:112 ~ addProduct ~ LIBRARY")
                                            productInfo = resp.data.result[0] as BuddyProductInfo;
                                            // console.log("🚀 ~ file: AddProducts.tsx:114 ~ addProduct ~ productInfo:", productInfo)
                                            if (productInfo && checkShopLimit(productInfo?.price.current_price)) {
                                                orderContext.itemsHandler(orderContext.items.length + 1, 'LIBRARY', 'add', productInfo);
                                            } else {
                                                Swal.fire({
                                                    title: 'You have reached your montly shop limit, please upgrade your subscription',
                                                    icon: 'error',
                                                });
                                                return;
                                            }
                                            break;
                                        case 'RAINFOREST':
                                            //console.log("🚀 ~ file: AddProducts.tsx:119 ~ addProduct ~ RAINFOREST")
                                            //  console.log("🚀 ~ file: AddProducts.tsx:110 ~ addProduct ~  resp.data:", resp.data)
                                            productInfo = resp.data as RainforestData;
                                            // console.log("🚀 ~ file: AddProducts.tsx:113 ~ addProduct ~ productInfo:", productInfo)
                                            if (resp.data && checkShopLimit(productInfo?.product.buybox_winner.price?.value)) {
                                                orderContext.itemsHandler(orderContext.items.length + 1, 'RAINFOREST', 'add', resp.data);
                                            } else {
                                                Swal.fire({
                                                    title: 'You have reached your montly shop limit, please upgrade your subscription',
                                                    icon: 'error',
                                                });
                                                return;
                                            }
                                            break;
                                        case 'OXYLABS':
                                            //console.log("🚀 ~ file: AddProducts.tsx:113 ~ addProduct ~ resp.data.results[0]:", resp.data.results[0].content)
                                            productInfo = resp.data.results[0].content as Content;
                                            // console.log("🚀 ~ file: AddProducts.tsx:118 ~ addProduct ~ productInfo:", productInfo)
                                            if (productInfo && checkShopLimit(productInfo?.price)) {
                                                orderContext.itemsHandler(orderContext.items.length + 1, 'OXYLABS', 'add', productInfo);
                                            } else {
                                                Swal.fire({
                                                    title: 'You have reached your montly shop limit, please upgrade your subscription',
                                                    icon: 'error',
                                                });
                                                return;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                } catch (error) {
                                    console.log('🚀 ~ file: AddProducts.tsx:98 ~ addProduct ~ error:', error);
                                }
                            } else {
                                Swal.fire({
                                    title: 'Failed to read product info, please try again or contact support',
                                    text: response.status.toString(),
                                    icon: 'error',
                                });
                            }

                            switch (response?.status) {
                                case 400:
                                    Swal.fire({
                                        title: 'Failed to read product info, please try again or contact support',
                                        text: response.status.toString(),
                                        icon: 'error',
                                    });

                                    break;

                                case 500:
                                    Swal.fire({
                                        title: 'ailed to read product info due to teh taffic. Please try again!',
                                        text: response.status.toString(),
                                        icon: 'error',
                                    });

                                    break;
                                case 404:
                                    Swal.fire({
                                        title: 'Failed to read product info due to teh taffic. Please try again!',
                                        text: response.status.toString(),
                                        icon: 'error',
                                    });
                                    break;
                                case 401:
                                    Swal.fire({
                                        title: 'ailed to read product info due to teh taffic. Please try again!',
                                        text: response.status.toString(),
                                        icon: 'error',
                                    });
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            Swal.fire({
                                title: 'This is not an product link.  ',

                                icon: 'error',
                            });
                            setLink('');
                            setIsLoading(false);
                        }
                    } else {
                        Swal.fire({
                            title: 'Only Amazon.com products are supported',
                            icon: 'error',
                        });
                        setLink('');
                        setIsLoading(false);
                    }
                }
            } catch (error: any) {
                Swal.fire({
                    title: 'Generic error! Failed to fetch the product, please try again',
                    text: 'catch Error: ' + error,
                    icon: 'error',
                });
                setLink('');
                setIsLoading(false);
            }
            setLink('');
            setIsLoading(false);
        }
    };
    const checkShopLimit = (itemPrice: number): boolean => {
        if (subContext.currentSubscription && subContext.currentSubscription?.subscriptionModel?.shopLimit! > 0) {
            if (subContext.currentSubscription?.totShopAmountPaid! + itemPrice >= subContext.currentSubscription?.subscriptionModel?.shopLimit!) {
                return false;
            }
        }
        return true;
    };
    const amountLeft = (): string => {
        if (subContext?.currentSubscription?.subscriptionModel?.shopLimit! > 0) {
            const tot = subContext?.currentSubscription?.subscriptionModel?.shopLimit! - subContext?.currentSubscription?.totShopAmountPaid! - basketTotal();
            // return tot.toFixed(2);
            return tot > 0 ? '$' + tot.toFixed(2) : '$0.00';
        } else {
            return 'Unlimited';
        }
    };
    const basketTotal = (): number => {
        let total = 0;
        orderContext.items.forEach(el => {
            total += el.price! * el.quantity;
        });
        return total;
    };
    return (
        <section id="add-products" className="mt-5">
            <div className="row">
                <div className="col-12 text-center">
                    <div className="items-input position-relative mb-5">
                        <input
                            className="form-control w-100"
                            type="text"
                            placeholder="Insert Amazon Item Link"
                            onChange={e => setLink(e.target.value)}
                            value={link}
                            disabled={
                                subContext.currentSubscription?.subscriptionModel?.shopLimit !== 0 &&
                                subContext.currentSubscription?.totShopAmountPaid! >= subContext.currentSubscription?.subscriptionModel?.shopLimit!
                            }
                        />
                        <button
                            className="btn btn-add-in sn btn-primary  rounded-0 "
                            onClick={addProduct}
                            disabled={
                                subContext.currentSubscription?.subscriptionModel?.shopLimit !== 0 &&
                                subContext.currentSubscription?.totShopAmountPaid! >= subContext.currentSubscription?.subscriptionModel?.shopLimit!
                            }
                        >
                            Add Item
                        </button>
                    </div>
                    {subContext?.currentSubscription ? (
                        <div className="w-100 d-flex justify-content-end">
                            <div className="d-flex flex-column ">
                                <div className="d-flex align-items-center justify-content-end ">
                                    <div className="mx-2 fs-5  m-0">
                                        <b> Monthly Shop budget left:</b>
                                    </div>
                                    <div className="d-flex align-items-center  justify-content-end" style={{ width: '30%' }}>
                                        <label className="text-danger h4 " htmlFor="spent-limit"></label>
                                        <input
                                            disabled={true}
                                            style={{ textAlign: 'center', fontWeight: 'bold', color: amountLeft() === '$0.00' ? '#dc3545' : '#198754' }}
                                            id="spent-limit"
                                            className="mw-100 h4 rounded-3 border-0 p-3"
                                            value={amountLeft()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <ModalOverlay show={isLoading}>
                <div className="d-flex flex-column justify-content-center my-3 rounded  ">
                    <img src={'/Loading-Blockchain.gif'} alt="" height={200} className="rounded-4" />
                </div>
            </ModalOverlay>
        </section>
    );
};

export default AddProducts;
