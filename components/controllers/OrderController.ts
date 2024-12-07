import { OrderStatus } from '../../types/Order';
import { OrderSB, ProductSB } from '../../types/OrderSB';
import { encryptData } from '../../utils/utils';

import { supabase } from '../../utils/supabaseClient';

export const getOrder = async (orderId: string): Promise<OrderSB | null> => {
    try {
        const encryptedOrderId = encryptData(orderId);
        const response = await fetch(`/api/getOrder?${new URLSearchParams({ orderId: encryptedOrderId })}`);
        const order = await response.json();
        //  console.log("🚀 ~ getOrder ~ order:", order)

        return order;
    } catch {
        return null;
    }
};

export const getOrderStatusFromAmazon = async (requestId: string) => {
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

export const updateOrder = async (orderId: string, orderObject: OrderSB) => {
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
export const updateBasket = async (ctx: any, wallet_address: string | undefined | null) => {
    try {
        const basketobj = generateBasketObject(ctx);
        const basket = {
            wallet_address: wallet_address,
            basket: basketobj,
        };
        const encryptedBasket = encryptData(JSON.stringify(basket));

        const response = await fetch('/api/updateBasket', {
            method: 'PATCH',
            body: encryptedBasket,
            headers: { 'Content-Type': 'plain/text' },
        });
        //	console.log("🚀 ~ file: OrderController.ts:70 ~ updateBasket ~ response:", response)

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

export const createOrder = async (ctx: any, orderId: string, address: string): Promise<any> => {
    try {
        const order = generateOrderObject(ctx, orderId, address);
        console.log('🚀 ~ createOrder ~ order:', order);
        const encryptedOrder = encryptData(JSON.stringify(order));

        const createOrderResponse = await fetch('/api/createOrder', {
            method: 'POST',
            body: encryptedOrder,
            headers: { 'Content-Type': 'plain/text' },
        });

        switch (createOrderResponse.status) {
            case 201:
                return { data: await createOrderResponse.json(), created: true };
            default:
                return { data: await createOrderResponse.json(), created: false };
        }
    } catch {
        return null;
    }
};

export const createOrderOnAmazon = async (orderCtx: any, configCtx: any, orderId: string) => {
    console.log('🚀 ~ createOrderOnAmazon ~ orderId:', orderId);
    console.log('🚀 ~ createOrderOnAmazon ~ ctx:', orderCtx);
    try {
        const order = generateTaxAmazonOrderObject(orderCtx, orderId);
        console.log('🚀 ~ createOrderOnAmazon ~ order:', order);
        console.log('🚀 ~ createOrderOnAmazon ~ ctx.config.zinc_api:', configCtx.config.amazon_api);
        const data = {
            amazon_api: configCtx.config.amazon_api,
            order,
        };
        const encryptedOrder = encryptData(JSON.stringify(data));
        console.log('🚀 ~ createOrderOnAmazon ~ encryptedOrder:', encryptedOrder);

        const createOrderResponse = await fetch('/api/createOrderOnAmazon', {
            method: 'POST',
            body: encryptedOrder,
            headers: { 'Content-Type': 'plain/text' },
        });
        const response = await createOrderResponse.json();
        console.log('🚀 ~ createOrderOnAmazon ~ response:', response);

        switch (createOrderResponse.status) {
            case 201:
                return { data: response.request_id, error: null };
            case 400:
                return { data: null, error: response.error };
            case 401:
                return { data: null, error: response.error };
            default:
                return { data: null, error: response.error };
            //  return null;
        }
    } catch (e) {
        return { data: null, error: e };

        // return null;
    }
};
export const createOrderOnWeb3 = async (subId: number, orderId: string | null, buyer: string): Promise<boolean> => {
    const { data: order, error } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
    try {
    } catch (error) {
        console.log('🚀 ~ createOrderOnWeb3 ~ error:', error);
    }
    try {
        //order.orderId, order.subtotalAmount, order.commision, order.shippingFees, order.buyer
        const OrderSBObj = { ...order } as OrderSB;
        const orderObj = { subId: subId, orderId: OrderSBObj.order_id, subtotalAmount: OrderSBObj.subtotal_amount, commision: OrderSBObj.commission, shippingFees: OrderSBObj.shipping_amount, buyer: OrderSBObj.wallet_address };
        console.log("🚀 ~ createOrderOnWeb3 ~ orderObj:", orderObj)
        console.log("🚀 ~ createOrderOnWeb3 ~ stringify orderObj:", JSON.stringify(orderObj))
        const encryptedOrder = encryptData(JSON.stringify(orderObj));
        console.log("🚀 ~ createOrderOnWeb3 ~ encryptedOrder:", encryptedOrder)


        const response = await fetch('/api/createOrderOnWeb3', {
            method: 'POST',
            body: encryptedOrder,
            headers: { 'Content-Type': 'plain/text' },
        });
        console.log('🚀 ~ file: OrderController.ts:136 ~ createOrderOnWeb3 ~ response', response.status);

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

const generateOrderObject = (ctx: any, orderId: string, address: string): OrderSB | null => {
    console.log('🚀 ~ file: OrderController.ts:136 ~ generateOrderObject ~ ctx', ctx.items);
    try {
        if (!ctx || !ctx.shippingInfo || !ctx.items) {
            return null;
        }
        return {
            wallet_address: address,
            country: 'US',
            status: OrderStatus.CREATED,
            order_id: orderId,
            email: ctx.email || '',
            currency: 'USD',
            retailer: ctx.retailer || '',
            subscription_id: ctx.currentSubscription || '',
            shipping_info: {
                first_name: ctx.shippingInfo.firstName || '',
                last_name: ctx.shippingInfo.lastName || '',
                address_line1: ctx.shippingInfo.addressLine1 || '',
                address_line2: ctx.shippingInfo.addressLine2 || '',
                zip_code: ctx.shippingInfo.zipCode || '',
                city: ctx.shippingInfo.city || '',
                state: ctx.shippingInfo.state || '',
                phone_number: ctx.shippingInfo.phoneNumber || '',
                email: ctx.shippingInfo.email || '',
            },
            products: ctx.items.map((product: ProductSB) => {
                return {
                    asin: product.asin || '',
                    image: product.image || '',
                    symbol: product.symbol || '',
                    title: product.title || '',
                    url: product.url || '',
                    price: product.price ? product.price.toFixed(2) : '0.00',
                    quantity: product.quantity || 0,
                };
            }),
        };
    } catch {
        return null;
    }
};
const generateBasketObject = (ctx: any): OrderSB | null => {
    try {
        return {
            products: ctx.items.map((product: ProductSB) => {
                return {
                    asin: product.asin,
                    image: product.image,
                    symbol: product.symbol,
                    title: product.title,
                    url: product.url,
                    quantity: product.quantity,
                };
            }),
        };
    } catch {
        return null;
    }
};
export const generateTaxAmazonOrderObject = (ctx: any, orderId: string): any => {
    try {
        return {
            orderId: `${orderId}-tax`,
            products: ctx.items.map((product: ProductSB) => {
                return {
                    product_id: product.asin,
                    quantity: product.quantity,
                    seller_selection_criteria: {
                        prime: true,
                        handling_days_max: 10,
                        condition_in: ['New'],
                    },
                };
            }),
            // max_price: 0,
            // ctx.items.reduce((totalCost: number, item: { price: number; quantity: number }) => {
            //      return totalCost + item.price * item.quantity;
            // }, 0) * 100,

            shipping_address: {
                firstName: ctx.shippingInfo.firstName,
                lastName: ctx.shippingInfo.lastName,
                addressLine1: ctx.shippingInfo.addressLine1,
                addressLine2: ctx.shippingInfo.addressLine2,
                zipCode: ctx.shippingInfo.zipCode,
                city: ctx.shippingInfo.city,
                state: ctx.shippingInfo.state,
                country: 'US',
                phoneNumber: ctx.shippingInfo.phoneNumber,
            },
        };
    } catch (error) {
        console.log('🚀 ~ generateTaxAmzonOrderObject ~ error:', error);
    }
};
