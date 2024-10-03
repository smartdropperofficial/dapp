import React, { createContext, useContext, useEffect } from 'react';
import { useState } from 'react';
import { BuddyProductInfo, Price } from '../types/BuddyProduct';
import { RainforestData, RainforestProduct } from '../types/scraperTypes/Rainforest';
import { ContextProductInfo, ProductInfo } from '../types/Product';
import { OutscraperResponse } from '../types/scraperTypes/Outscraper';
import { Content } from '../types/scraperTypes/oxylabs';
import { ShippingInfo } from '../types/Order';
import { RETAILERS, ZONE } from '../utils/constants';
import { SubscriptionManagementModel } from '@/hooks/Contracts/Subscription/types';
import { SubscriptionContext } from './subscription-context';
import { supabase } from '@/utils/supabaseClient';
import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';

type ShippingInfoType = {
    firstName: string;
    lastName: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    zipCode: string;
    city: string;
    state: string;
    phoneNumber: string;
};
type CheckoutType = {
    items: number;
    zincFees: number;
    shippingFees: number;
    exchangeFees: number;
    fees: number;
    tax: number;
    total?: number;
    canpay?: boolean;
};
interface OrderContextProps {
    items: ContextProductInfo[];
    checkout: CheckoutType;
    retailer: string;
    zone: string;
    email: string;
    isLoading: boolean;
    currentStep: number;
    shippingInfo: ShippingInfoType;
    scraper: string;
    showErrors: boolean;
    shippingInfoHandler: (payload: ShippingInfoType) => void;
    itemsHandler: (
        id: number,
        scraper: string,
        action: string,
        productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
    ) => void;
    changeAddressHandler: (
        id: number,
        scraper: string,
        quantity: number,
        productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
    ) => void;
    cleanItems: () => void;
    incrementHandler: (id: number, action: string, productInfo?: BuddyProductInfo | ProductInfo) => void;
    stepsHandler: (action: string) => void;
    retailerHandler: (retailer: string) => void;
    zoneHandler: (retailer: string) => void;
    showErrorsToggle: () => void;
    updateScraper: (scraper: string) => void;
    isLoadingHandler: (loading: boolean) => void;
    emailHandler: (payload: string) => void;
    checkoutHandler: (payload: CheckoutType) => void;
    basketTotal: () => number;
}

export const OrderContext = createContext<OrderContextProps>(null as unknown as OrderContextProps);

export const OrderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const subContext = useContext(SubscriptionContext);
    const [items, setItems] = useState<ContextProductInfo[]>([]);
    const [shippingInfo, setShippingInfo] = useState<ShippingInfoType>({
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        zipCode: '',
        city: '',
        state: '',
        phoneNumber: '',
        email: '',
    });
    const [checkout, setCheckout] = useState<CheckoutType>({
        items: 0,
        zincFees: 0,
        shippingFees: 0,
        exchangeFees: 0,
        fees: 0,
        tax: 0,
        total: 0,
        canpay: true,
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [showErrors, setShowErrors] = useState(false);
    const [scraper, setScraper] = useState('');
    const [retailer, setRetailer] = useState<string>(RETAILERS.AMAZON);
    const [zone, setZone] = useState<string>(ZONE.US);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string>('');

    const cleanItems = () => {
        items.splice(0, items.length);
        setItems([...items]); // Update the state with the modified array
    };
    const changeAddressHandler = (
        id: number,
        scraper: string,
        quantity: number,
        productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
    ) => {
        if (productInfo) {
            let newItems: any;
            switch (scraper) {
                case 'RAINFOREST':
                    newItems = [
                        items,
                        {
                            id: id,
                            quantity: 1,
                            price: (productInfo as RainforestData).product.buybox_winner.price.value,
                            symbol: (productInfo as RainforestData).product.buybox_winner.price.symbol,
                            image: (productInfo as RainforestData).product.main_image.link,
                            title: (productInfo as RainforestData).product.title,
                            url: (productInfo as RainforestData).request_metadata.amazon_url,
                            asin: (productInfo as RainforestData).product.asin,
                        },
                    ].flat();
                    break;
                case 'LIBRARY':
                    newItems = [
                        items,
                        {
                            id: id,
                            quantity: 1,
                            price: (productInfo as BuddyProductInfo).price.current_price,
                            symbol: (productInfo as BuddyProductInfo).price.symbol,
                            image: (productInfo as BuddyProductInfo).main_image,
                            title: (productInfo as BuddyProductInfo).title,
                            url: (productInfo as BuddyProductInfo).url,
                            asin: (productInfo as BuddyProductInfo).asin,
                        },
                    ].flat();
                    break;
                case 'OXYLABS':
                    newItems = [
                        items,
                        {
                            id: id,
                            quantity: 1,
                            price: (productInfo as Content).price,
                            symbol: (productInfo as Content).currency,
                            image: (productInfo as Content).images[0],
                            title: (productInfo as Content).title,
                            url: (productInfo as Content).url,
                            asin: (productInfo as Content).asin,
                        },
                    ].flat();

                    break;

                default:
                    break;
            }
        }
    };
    const itemsHandler = (
        id: number,
        scraper: string,
        action: string,
        productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
    ) => {
        //console.log("🚀 ~ file: order-context.tsx:101 ~ itemsHandler ~ scraper:", scraper)
        // console.log("🚀 ~ file: order-context.tsx:100 ~ itemsHandler ~ productInfo:", productInfo)
        console.log(productInfo);
        if (action === 'add') {
            if (productInfo) {
                let currentItem;
                switch (scraper) {
                    case 'RAINFOREST':
                        currentItem = items.find(item => item.asin === (productInfo as BuddyProductInfo)?.asin);
                        break;
                    case 'LIBRARY':
                        currentItem = items.find(item => item.asin === (productInfo as RainforestProduct)?.asin);
                        break;
                    case 'OXYLABS':
                        currentItem = items.find(item => item.asin === (productInfo as Content)?.asin);
                        break;

                    default:
                        break;
                }

                if (currentItem) {
                    // Se l'elemento esiste già, aggiorna la quantità
                    setItems(prevItems => {
                        const newItems = [...prevItems];
                        const index = prevItems.indexOf(currentItem);
                        const quantity = newItems[index].quantity + 1;

                        // Aggiorna l'elemento con la nuova quantità
                        newItems[index] = { ...newItems[index], quantity: quantity };

                        // Esegui modifyBasketOnDB con il nuovo array
                        modifyBasketOnDB(session?.address!, newItems);

                        return newItems; // Ritorna il nuovo array per aggiornare lo stato
                    });
                } else {
                    // Se l'elemento non esiste, crea un nuovo oggetto in base allo scraper
                    setItems(prevItems => {
                        let newItems: any;

                        switch (scraper) {
                            case 'RAINFOREST':
                                newItems = [
                                    ...prevItems,
                                    {
                                        id: id,
                                        quantity: 1,
                                        price: (productInfo as RainforestData).product.buybox_winner.price?.value,
                                        symbol: (productInfo as RainforestData).product.buybox_winner.price?.symbol,
                                        image: (productInfo as RainforestData).product.main_image?.link,
                                        title: (productInfo as RainforestData).product?.title,
                                        url: (productInfo as RainforestData).request_metadata?.amazon_url,
                                        asin: (productInfo as RainforestData).product?.asin,
                                    },
                                ];
                                break;
                            case 'LIBRARY':
                                newItems = [
                                    ...prevItems,
                                    {
                                        id: id,
                                        quantity: 1,
                                        price: (productInfo as BuddyProductInfo)?.price?.current_price,
                                        symbol: (productInfo as BuddyProductInfo)?.price?.symbol,
                                        image: (productInfo as BuddyProductInfo)?.main_image,
                                        title: (productInfo as BuddyProductInfo)?.title,
                                        url: (productInfo as BuddyProductInfo)?.url,
                                        asin: (productInfo as BuddyProductInfo)?.asin,
                                    },
                                ];
                                break;
                            case 'OXYLABS':
                                newItems = [
                                    ...prevItems,
                                    {
                                        id: id,
                                        quantity: 1,
                                        price: (productInfo as Content)?.price,
                                        symbol: (productInfo as Content)?.currency,
                                        image: (productInfo as Content)?.images[0],
                                        title: (productInfo as Content)?.title,
                                        url: (productInfo as Content)?.url,
                                        asin: (productInfo as Content)?.asin,
                                    },
                                ];
                                break;
                            default:
                                return prevItems; // Se lo scraper non è riconosciuto, ritorna lo stato precedente
                        }

                        // Esegui modifyBasketOnDB con il nuovo array
                        modifyBasketOnDB(session?.address!, newItems);

                        return newItems; // Ritorna il nuovo array per aggiornare lo stato
                    });
                }
            }
        } else if (action === 'remove') {
            const currentItem = items.find(item => item.id === id)!;
            const index = items.indexOf(currentItem);
            const quantity = items[index].quantity - 1;

            if (quantity > 0) {
                const newItems = [...items];
                newItems[index] = { ...newItems[index], quantity: quantity };

                setItems(newItems);
            } else {
                const newItems = items
                    .filter((el: ContextProductInfo) => el.id !== id)
                    .map((el: ContextProductInfo, i) => {
                        return { ...el, id: i + 1 };
                    });
                setItems(newItems);
            }
        } else {
            setItems([]);
        }
    };
    const incrementHandler = (id: number, action: string) => {
        const currentItem = items.find(item => item.id === id)!;
        var quantity = 0;
        if (currentItem) {
            const newItems = [...items];
            const index = items.indexOf(currentItem);
            quantity = newItems[index].quantity;

            const price = newItems[index].price || 0;
            var newtotalAmount;
            switch (action) {
                case 'add':
                // quantity = newItems[index].quantity + 1;
                // newtotalAmount = price * quantity;
                // newItems[index] = {
                //     ...newItems[index],
                //     quantity: quantity,
                // };
                // setItems(newItems);
                case 'add':
                    setItems(prevItems => {
                        // Crea una copia dello stato precedente
                        const newItems = [...prevItems];

                        // Calcola la nuova quantità
                        const quantity = newItems[index].quantity + 1;

                        // Calcola il nuovo totalAmount

                        // Aggiorna l'elemento all'indice specificato con i nuovi dati
                        newItems[index] = {
                            ...newItems[index],
                            quantity: quantity,
                        };

                        // Esegui modifyBasketOnDB con il nuovo array
                        modifyBasketOnDB(session?.address!, newItems);

                        // Ritorna il nuovo array per aggiornare lo stato
                        return newItems;
                    });

                    return;
                    break;
                case 'decrement':
                    if (quantity > 0) {
                        quantity = newItems[index].quantity - 1;
                        if (quantity < 1) {
                            // const newItems = items
                            //   .filter((el: ContextProductInfo) => el.id !== id)
                            //   .map((el: ContextProductInfo, i) => {
                            //     return { ...el, id: i + 1 };
                            //   });

                            // setItems(newItems);
                            return;
                        } else {
                            newtotalAmount = price * quantity;
                            // newItems[index] = {
                            //     ...newItems[index],
                            //     quantity: quantity,

                            // };
                            // setItems(newItems);
                            setItems(prevItems => {
                                // Crea una copia dello stato precedente
                                const newItems = [...prevItems];

                                // Calcola il nuovo totalAmount

                                // Sovrascrivi l'item selezionato con i nuovi dati
                                newItems[index] = {
                                    ...newItems[index],
                                    quantity: quantity,
                                };

                                // Esegui modifyBasketOnDB con il nuovo array
                                modifyBasketOnDB(session?.address!, newItems);

                                // Ritorna il nuovo array per aggiornare lo stato
                                return newItems;
                            });
                        }
                    }
                    break;
                case 'delete':
                    // const filtered = items.filter(items => items.id !== id);
                    // const newArray = [...filtered];
                    // setItems(newArray);
                    // modifyBasketOnDB(session?.address!, newArray);

                    setItems(prevItems => {
                        const filtered = prevItems.filter(item => item.id !== id);
                        const newArray = [...filtered];

                        // Esegui modifyBasketOnDB con il nuovo array
                        modifyBasketOnDB(session?.address!, newArray);

                        return newArray; // Questo aggiorna lo stato con il nuovo array
                    });
                    break;

                default:
                    break;
            }
        }
    };
    const stepsHandler = (action: string) => {
        if (action === 'increase') {
            setCurrentStep(step => step + 1);
        } else if (action === 'decrease') {
            setCurrentStep(step => step - 1);
        } else {
            setCurrentStep(1);
        }
    };
    const shippingInfoHandler = (payload: ShippingInfoType) => {
        setShippingInfo(payload);
    };
    const showErrorsToggle = () => {
        setShowErrors(prev => !prev);
    };
    const retailerHandler = (retailer: string) => {
        setRetailer(retailer);
    };
    const zoneHandler = (zone: string) => {
        setZone(zone);
    };
    const updateScraper = (scraper: string) => {
        setScraper(scraper);
    };
    const isLoadingHandler = (loading: boolean) => {
        setIsLoading(loading);
    };
    const basketTotal = (): number => {
        return items.reduce((acc, item) => acc + item.price! * item.quantity, 0);
    };
    const emailHandler = (payload: string) => {
        setEmail(payload);
    };

    const checkoutHandler = (payload: CheckoutType) => {
        setCheckout({
            ...payload,
            canpay: payload.items + subContext.currentSubscription?.totShopAmountPaid! <= subContext.currentSubscription?.subscriptionModel?.shopLimit!,
            total: payload.items + payload.zincFees + payload.shippingFees + payload.exchangeFees + payload.fees + payload.tax,
        });
    };
    useEffect(() => {
        const fetchBasketItems = async (wallet: string) => {
            try {
                const items: ContextProductInfo[] = await getBasketOnDB(wallet);
                if (items?.length > 0) {
                    setItems(items);
                }
            } catch (error) {
                console.log('🚀 ~ useEffect ~ error:', error);
            }
        };
        if (session?.address) fetchBasketItems(session?.address);
    }, [session]);

    const modifyBasketOnDB = async (wallet: string, items: any) => {
        try {
            // Prova ad aggiornare il record
            const { data: editData, error: editError } = await supabase.from('basket').update({ products: items }).eq('wallet_address', wallet).select();

            if (editError) {
                console.log('🚀 ~ modifyBasketOnDB ~ editError:', editError);
                return;
            }

            // Se nessun record è stato aggiornato (editData è vuoto), inserisci un nuovo record
            if (editData.length === 0) {
                console.log('Nessun record trovato, creando un nuovo record nel database.');

                const { data: addData, error: addError } = await supabase
                    .from('basket')
                    .insert([{ wallet_address: wallet, products: items }])
                    .select();

                if (addError) {
                    console.log('🚀 ~ modifyBasketOnDB ~ addError:', addError);
                } else {
                    console.log('Record aggiunto con successo:', addData);
                }
            } else {
                console.log('Record aggiornato con successo:', editData);
            }
        } catch (error) {
            console.log('🚀 ~ modifyBasketOnDB ~ error:', error);
        }
    };

    const getBasketOnDB = async (wallet: string): Promise<ContextProductInfo[]> => {
        try {
            let { data: basket, error } = await supabase.from('basket').select('*').eq('wallet_address', wallet);
            if (error || !basket || basket.length === 0) {
                return [];
            }
            const products = typeof basket[0]?.products === 'string' ? JSON.parse(basket[0]?.products) : basket[0]?.products;

            return products as ContextProductInfo[];
        } catch (error) {
            console.log('🚀 ~ getBasketOnDB ~ error:', error);
            return [];
        }
    };

    useEffect(() => {
        try {
            const info = JSON.parse(localStorage.getItem('shippingInfo') ?? '{}') as ShippingInfoType;
            if (info?.firstName) {
                setShippingInfo(info);
            }
        } catch (error) {
            console.log('🚀 ~ useEffect ~ error:', error);
        }
    }, []);

    // useEffect(() => {
    //     const syncBasketWithDB = async () => {
    //         if (process.env.NODE_ENV === 'development') {
    //             try {
    //                 if (items.length > 0 && session?.address) {
    //                     const updatedItems = await modifyBasketOnDB(session.address, items);
    //                 }
    //             } catch (error) {
    //                 console.log('🚀 ~ useEffect ~ error:', error);
    //             }
    //         }
    //     };
    //     syncBasketWithDB();
    // }, [items, session]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            try {
                localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
            } catch (error) {
                console.log('🚀 ~ useEffect ~ error:', error);
            }
        }
    }, [shippingInfo]);
    return (
        <OrderContext.Provider
            value={{
                items,
                checkout,
                retailer,
                zone,
                email,
                isLoading,
                currentStep,
                shippingInfo,
                scraper,
                showErrors,
                shippingInfoHandler,
                itemsHandler,
                changeAddressHandler,
                cleanItems,
                incrementHandler,
                stepsHandler,
                retailerHandler,
                zoneHandler,
                showErrorsToggle,
                updateScraper,
                isLoadingHandler,
                emailHandler,
                checkoutHandler,
                basketTotal,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

// const store = {
//     items: items,
//     retailer: retailer,
//     zone: zone,
//     isLoading: isLoading,
//     currentStep: currentStep,
//     shippingInfo: shippingInfo,
//     showErrors: showErrors,
//     scraper: scraper,
//     email: email,
//     checkout: checkout,
//     infoHandler: shippingInfoHandler,
//     itemsHandler: itemsHandler,
//     cleanItems: cleanItems,
//     changeAddressHandler: changeAddressHandler,
//     incrementHandler: incrementHandler,
//     stepsHandler: stepsHandler,
//     showErrorsToggle: showErrorsToggle,
//     updateScraper: updateScraper,
//     retailerHandler: retailerHandler,
//     isLoadingHandler: isLoadingHandler,
//     basketTotal: basketTotal,
//     emailHandler: emailHandler,
//     zoneHandler: zoneHandler,
//     checkoutHander: checkoutHander,
// };

export default OrderContextProvider;
