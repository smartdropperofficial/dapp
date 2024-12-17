// useOrder.ts
import { useCallback, useContext, useState } from 'react';
import { OrderStatus } from '../../types/Order';
import { OrderSB, ProductSB } from '../../types/OrderSB';
import { encryptData } from '../../utils/utils';
import { supabase } from '../../utils/supabaseClient';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
import { OrderContext } from '../../store/order-context';
import { ConfigContext } from '@/store/config-context';
import useSubscriptionModel from '@/hooks/Database/subscription/useSubscription';
import { SubscriptionContext } from '@/store/subscription-context';

export const useOrder = () => {
    const { getCanShop } = useSubscriptionModel();
    const { currentSubscription, setCanShopHandler, canShop } = useContext(SubscriptionContext);

    const { data: session } = useSession() as { data: SessionExt | null };
    const orderCtx = useContext(OrderContext);
    const configCtx = useContext(ConfigContext);
    const getOrder = async (orderId: string): Promise<OrderSB | null> => {
        try {
            const encryptedOrderId = encryptData(orderId);
            const response = await fetch(`/api/getOrder?${new URLSearchParams({ orderId: encryptedOrderId })}`);
            const order = await response.json();
            // console.log("🚀 ~ getOrder ~ order:", order);
            return order;
        } catch {
            return null;
        }
    };

    const getOrderStatusFromAmazon = async (requestId: string) => {
        try {
            const encryptedRequestId = encryptData(requestId);
            const response = await fetch(`/api/getOrderStatus?${new URLSearchParams({ requestId: encryptedRequestId })}`);
            if (response.status === 200) {
                const orderDetails = await response.json();
                return orderDetails;
            } else {
                return null;
            }
        } catch {
            return null;
        }
    };

    const updateOrder = async (orderId: string, orderObject: OrderSB) => {
        try {
            const order = {
                orderId: orderId,
                order: orderObject,
            };
            console.log('🚀 ~ updateOrder ~ order:', order);
            const encryptedOrder = encryptData(JSON.stringify(order));
            const response = await fetch('/api/updateOrder', {
                method: 'PATCH',
                body: encryptedOrder,
                headers: { 'Content-Type': 'plain/text' },
            });
            console.log('🚀 ~ updateOrder ~ response.status:', response.status);

            switch (response.status) {
                case 200:
                    return true;
                default:
                    return null;
            }
        } catch {
            return null;
        }
    };

    // const createOrder = async (orderId: string): Promise<any> => {
    //     console.log('🚀 ~ createOrder ~ orderId:', orderId);
    //     console.log('🚀 ~ createOrder ~ orderCtx:', orderCtx);
    //     try {
    //         const order = generateOrderObject();
    //         console.log('🚀 ~ createOrder ~ order:', order);
    //         const encryptedOrder = encryptData(JSON.stringify(order));
    //         console.log('🚀 ~ createOrder ~ encryptedOrder:', encryptedOrder);

    //         const createOrderResponse = await fetch('/api/createOrder', {
    //             method: 'POST',
    //             body: encryptedOrder,
    //             headers: { 'Content-Type': 'plain/text' },
    //         });

    //         switch (createOrderResponse.status) {
    //             case 201:
    //                 return { data: await createOrderResponse.json(), created: true };
    //             default:
    //                 return { data: await createOrderResponse.json(), created: false };
    //         }
    //     } catch {
    //         return null;
    //     }
    // };
    const createPreOrder = useCallback(async (): Promise<any> => {
        if (setCanShopHandler && getCanShop && SubscriptionContext) {
            if (currentSubscription?.id!) {
                console.log('🚀 ~ createPreOrder ~ currentSubscription?.id!:', currentSubscription?.id!);
                const res = await getCanShop(currentSubscription?.id!);
                console.log('🚀 ~ createPreOrder ~ getCanShop:', res);
                console.log('🚀 ~ createPreOrder ~ setting setCanShopHandler : start');
                setCanShopHandler(res);
                console.log('🚀 ~ createPreOrder ~ setting setCanShopHandler : End');
            } else {
                console.log('🚀 ~ createPreOrder ~ setting setCanShopHandler : true - non Subscription Found!');
                setCanShopHandler(true);
            }

            if (canShop) {
                console.log('🚀 ~ createPreOrder ~ canShop:', canShop);
                try {
                    console.log('🚀 ~ createPreOrder ~ generatePreOrderObject: start');
                    const order = generatePreOrderObject();
                    console.log('🚀 ~ createPreOrder ~ generatePreOrderObject: end');

                    console.log('🚀 ~ createOrder ~ order:', order);
                    console.log('🚀 ~ createOrder ~ encryptData:start');
                    const encryptedOrder = encryptData(JSON.stringify(order));
                    console.log('🚀 ~ createOrder ~ encryptData:end');
                    console.log('🚀 ~ createOrder ~ /api/createPreOrder: start');
                    const createOrderResponse = await fetch('/api/createPreOrder', {
                        method: 'POST',
                        body: encryptedOrder,
                        headers: { 'Content-Type': 'plain/text' },
                    });
                    console.log('🚀 ~ createOrder ~ /api/createPreOrder: end');

                    switch (createOrderResponse.status) {
                        case 201:
                            return { data: await createOrderResponse.json(), created: true };
                        default:
                            return { data: await createOrderResponse.json(), created: false };
                    }
                } catch {
                    return null;
                }
            } else {
                return { error: 'This amount exceed maximum limit for this subscription level.', created: false };
            }
        }
    }, [getCanShop, setCanShopHandler, SubscriptionContext, currentSubscription]);

    // const createOrderOnAmazon = async (orderId: string) => {
    //     console.log('🚀 ~ createOrderOnAmazon ~ orderId:', orderId);
    //     console.log('🚀 ~ createOrderOnAmazon ~ orderCtx:', orderCtx);
    //     try {
    //         const order = generateTaxAmazonOrderObject(orderId);
    //         console.log('🚀 ~ createOrderOnAmazon ~ order:', order);
    //         console.log('🚀 ~ createOrderOnAmazon ~ ctx.config.amazon_api:', configCtx?.config?.amazon_api);
    //         const data = {
    //             amazon_api: configCtx?.config?.amazon_api,
    //             order,
    //         };
    //         const encryptedOrder = encryptData(JSON.stringify(data));
    //         console.log('🚀 ~ createOrderOnAmazon ~ encryptedOrder:', encryptedOrder);

    //         const createOrderResponse = await fetch('/api/createOrderOnAmazon', {
    //             method: 'POST',
    //             body: encryptedOrder,
    //             headers: { 'Content-Type': 'plain/text' },
    //         });
    //         const response = await createOrderResponse.json();
    //         console.log('🚀 ~ createOrderOnAmazon ~ response:', response);

    //         switch (createOrderResponse.status) {
    //             case 201:
    //                 return { data: response.request_id, error: null };
    //             case 400:
    //                 return { data: null, error: response.error };
    //             case 401:
    //                 return { data: null, error: response.error };
    //             default:
    //                 return { data: null, error: response.error };
    //         }
    //     } catch (e) {
    //         return { data: null, error: e };
    //     }
    // };

    const createOrderOnWeb3 = async (subId: number, orderId: string | null, buyer: string): Promise<boolean> => {
        try {
            const { data: order, error } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
            if (error || !order) {
                console.log('🚀 ~ createOrderOnWeb3 ~ error:', error);
                return false;
            }

            const orderSBObj = order as OrderSB;
            const orderObj = {
                subId: subId,
                orderId: orderSBObj.order_id,
                subtotalAmount: orderSBObj.subtotal_amount,
                commission: orderSBObj.commission,
                shippingFees: orderSBObj.shipping_amount,
                buyer: orderSBObj.wallet_address,
            };
            console.log('🚀 ~ createOrderOnWeb3 ~ orderObj:', orderObj);
            console.log('🚀 ~ createOrderOnWeb3 ~ stringify orderObj:', JSON.stringify(orderObj));
            const encryptedOrder = encryptData(JSON.stringify(orderObj));
            console.log('🚀 ~ createOrderOnWeb3 ~ encryptedOrder:', encryptedOrder);

            const response = await fetch('/api/createOrderOnWeb3', {
                method: 'POST',
                body: encryptedOrder,
                headers: { 'Content-Type': 'plain/text' },
            });
            console.log('🚀 ~ createOrderOnWeb3 ~ response', response.status);

            switch (response.status) {
                case 200:
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            console.log('🚀 ~ createOrderOnWeb3 ~ error:', error);
            return false;
        }
    };

    const generateOrderObject = (): OrderSB | null => {
        console.log('🚀 ~ generateOrderObject ~ ctx.items:', orderCtx.items);
        try {
            return {
                wallet_address: session?.address!,
                country: 'US',
                status: OrderStatus.CREATED,
                //   order_id: orderId,
                email: session?.email!,
                currency: 'USD',
                retailer: orderCtx.retailer,
                shipping_info: {
                    first_name: orderCtx.shippingInfo.firstName,
                    last_name: orderCtx.shippingInfo.lastName,
                    address_line1: orderCtx.shippingInfo.addressLine1,
                    address_line2: orderCtx.shippingInfo.addressLine2,
                    zip_code: orderCtx.shippingInfo.zipCode,
                    city: orderCtx.shippingInfo.city,
                    state: orderCtx.shippingInfo.state,
                    phone_number: orderCtx.shippingInfo.phoneNumber,
                    email: orderCtx.shippingInfo.email,
                },
                products: orderCtx?.items?.map((product: any) => {
                    return {
                        asin: product.asin,
                        image: product.image,
                        symbol: product.symbol,
                        title: product.title,
                        url: product.url,
                        price: Number(product.price),
                        quantity: product.quantity,
                    };
                }),
            };
        } catch (error) {
            console.log('🚀 ~ generateOrderObject ~ error:', error);
            return null;
        }
    };
    const generatePreOrderObject = (): OrderSB | null => {
        console.log('🚀 ~ generateOrderObject ~ ctx.items:', orderCtx.items);
        try {
            return {
                wallet_address: session?.address!,
                country: 'US',
                status: OrderStatus.CREATED,
                email: session?.email!,
                currency: 'USD',
                retailer: orderCtx.retailer,
                subscription_id: currentSubscription?.id!,
                shipping_info: {
                    first_name: orderCtx.shippingInfo.firstName,
                    last_name: orderCtx.shippingInfo.lastName,
                    address_line1: orderCtx.shippingInfo.addressLine1,
                    address_line2: orderCtx.shippingInfo.addressLine2,
                    zip_code: orderCtx.shippingInfo.zipCode,
                    city: orderCtx.shippingInfo.city,
                    state: orderCtx.shippingInfo.state,
                    phone_number: orderCtx.shippingInfo.phoneNumber,
                    email: orderCtx.shippingInfo.email,
                },
                products: orderCtx?.items?.map((product: any) => {
                    return {
                        asin: product.asin,
                        image: product.image,
                        symbol: product.symbol,
                        title: product.title,
                        url: product.url,
                        price: Number(product.price),
                        quantity: product.quantity,
                    };
                }),
            };
        } catch (error) {
            console.log('🚀 ~ generateOrderObject ~ error:', error);
            return null;
        }
    };

    // const generateTaxAmazonOrderObject = (orderId: string): any => {
    //     try {
    //         return {
    //             orderId: `${orderId}-tax`,
    //             products: orderCtx.items.map((product: any) => {
    //                 return {
    //                     product_id: product.asin,
    //                     quantity: product.quantity,
    //                     seller_selection_criteria: {
    //                         prime: true,
    //                         handling_days_max: 10,
    //                         condition_in: ['New'],
    //                     },
    //                 };
    //             }),
    //             // max_price: 0,
    //             // ctx.items.reduce((totalCost: number, item: { price: number; quantity: number }) => {
    //             //      return totalCost + item.price * item.quantity;
    //             // }, 0) * 100,

    //             shipping_address: {
    //                 firstName: orderCtx.shippingInfo.firstName,
    //                 lastName: orderCtx.shippingInfo.lastName,
    //                 addressLine1: orderCtx.shippingInfo.addressLine1,
    //                 addressLine2: orderCtx.shippingInfo.addressLine2,
    //                 zipCode: orderCtx.shippingInfo.zipCode,
    //                 city: orderCtx.shippingInfo.city,
    //                 state: orderCtx.shippingInfo.state,
    //                 country: 'US',
    //                 phoneNumber: orderCtx.shippingInfo.phoneNumber,
    //             },
    //         };
    //     } catch (error) {
    //         console.log('🚀 ~ generateTaxAmzonOrderObject ~ error:', error);
    //     }
    // };
    return {
        getOrder,
        getOrderStatusFromAmazon,
        updateOrder,
        // createOrder,
        createPreOrder,
        // createOrderOnAmazon,
        createOrderOnWeb3,
        generateOrderObject,
        // generateTaxAmazonOrderObject,
    };
};
