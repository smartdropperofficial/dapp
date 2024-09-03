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

}
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

// export const OrderContext = createContext(
//     {
//     items: [] as ContextProductInfo[],
//     checkout: {} as CheckoutType,   
//     retailer: '',
//     zone: '',
//     email: '',
//     isLoading: false,
//     currentStep: 1,
//     shippingInfo: {
//         firstName: '',
//         lastName: '',
//         email: '',
//         addressLine1: '',
//         addressLine2: '',
//         zipCode: '',
//         city: '',
//         state: '',
//         phoneNumber: '',
//     },
//     scraper: '',
//     showErrors: false, 
//     infoHandler: (payload: ShippingInfoType) => {},
//     itemsHandler: (
//         id: number,
//         scraper: string,
//         action: string,
//         productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
//     ) => {},
//     changeAddressHandler: (
//         id: number,
//         scraper: string,
//         quantity: number,
//         productInfo?: BuddyProductInfo | ProductInfo | RainforestProduct | RainforestData | Content
//     ) => {},
//     cleanItems: () => {} ,
//     incrementHandler: (id: number, action: string, productInfo?: BuddyProductInfo | ProductInfo) => {},
//     stepsHandler: (action: string) => {},
//     retailerHandler: (retailer: string) => {},
//     zoneHandler: (retailer: string) => {},
//     showErrorsToggle: () => {},
//     updateScraper: (scraper: string) => {},
//     isLoadingHandler: (loading: boolean) => {},
//     emailHandler: (payload: string) => {}, 
//     checkoutHander: (payload: CheckoutType) => {},   
//     basketTotal: () => {} ,  
// }

// );  
export const OrderContext = createContext<OrderContextProps>(null as unknown as OrderContextProps);

export const OrderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                    const newItems = [...items];
                    const index = items.indexOf(currentItem);
                    const quantity = newItems[index].quantity + 1;
                    newItems[index] = { ...newItems[index], quantity: quantity };
                    setItems(newItems);
                } else {
                    let newItems: any;
                    switch (scraper) {
                        case 'RAINFOREST':
                            newItems = [
                                items,
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
                            ].flat();
                            break;
                        case 'LIBRARY':
                            newItems = [
                                items,
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
                            ].flat();
                            break;
                        case 'OXYLABS':
                            newItems = [
                                items,
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
                            ].flat();
                            break;

                        default:
                            break;
                    }
                    //console.log("🚀 ~ file: order-context.tsx:104 ~ itemsHandler ~ newItems:", newItems)

                    setItems(newItems);
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
                    quantity = newItems[index].quantity + 1;
                    newtotalAmount = price * quantity;
                    newItems[index] = {
                        ...newItems[index],
                        quantity: quantity,
                        // totalAmount: newtotalAmount,
                    }; //  Sovrascrivi l'item selezionato con i nuovi dati
                    setItems(newItems);
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
                            newItems[index] = {
                                ...newItems[index],
                                quantity: quantity,
                                // totalAmount: newtotalAmount,
                            }; //  Sovrascrivi l'item selezionato con i nuovi dati
                            setItems(newItems);
                        }
                    }
                    break;
                case 'delete':
                    const filtered = items.filter(items => items.id !== id);
                    const newArray = [...filtered];
                    setItems(newArray);
                    break;

                default:
                    break;
            }
            // const quantity = newItems[index].quantity + 1;
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
            canpay: (payload.items + subContext.currentSubscription?.totShopAmountPaid!) <= subContext.currentSubscription?.subscriptionModel.shopLimit!,
            total: payload.items + payload.zincFees + payload.shippingFees + payload.exchangeFees + payload.fees + payload.tax,
        });
    };
    useEffect(() => {
        try {
            const cartItemsData = JSON.parse(localStorage.getItem('basket') ?? '[]') as ContextProductInfo[];
            if (cartItemsData?.length > 0) {
                setItems(cartItemsData);
            }
        } catch (error) {
            console.log('🚀 ~ useEffect ~ error:', error);
        }
    }, []);

    useEffect(() => {
        try {
            const info = JSON.parse(localStorage.getItem('shippingInfo') ?? '{}') as ShippingInfoType;
            if (info?.firstName !== '') {
                setShippingInfo(info);
            }
        } catch (error) {
            console.log('🚀 ~ useEffect ~ error:', error);
        }
    }, []);

    useEffect(() => {
        try {
            if (items.length > 0) {
                localStorage.setItem('basket', JSON.stringify(items));
            }
        } catch (error) {
            console.log('🚀 ~ useEffect ~ error:', error);
        }
    }, [items]);
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
