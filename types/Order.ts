export interface Order {
    walletAddress: string;
    country: string;
    orderStatus: OrderStatus;
    orderId: string;
    shippingInfo: ShippingInfo;
    amountPaid: string;
}

export interface ShippingInfo {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    zipCode: string;
    city: string;
    state: string;
    phoneNumber: string;
}

export enum OrderStatus {
    BASKET = 'BASKET',
    CREATED = 'CREATED',
    WAITING_TAX = 'WAITING_TAX',
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    SENT_TO_AMAZON = 'SENT_TO_AMAZON',
    RETURNED_TO_AMAZON = 'RETURNED_TO_AMAZON',
    RETURNED = 'RETURNED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED',
    SHIPPING_ADDRESS_REFUSED = 'SHIPPING_ADDRESS_REFUSED',
    PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
    ERROR = 'ERROR',
    INSUFFICIENT_ZMA_BALANCE = 'INSUFFICIENT_ZMA_BALANCE',
}
export const OrderTableStatus = {
    CREATED: { value: 'CREATED', description: 'Created' },
    WAITING_TAX: { value: 'WAITING_TAX', description: 'Waiting Tax' },
    WAITING_CONFIRMATION: { value: 'WAITING_CONFIRMATION', description: 'Confirm Order' },
    ORDER_CONFIRMED: { value: 'ORDER_CONFIRMED', description: 'Order Confirmed' },
    SENT_TO_AMAZON: { value: 'SENT_TO_AMAZON', description: 'Sent to Amazon' },
    SHIPPING_ADDRESS_REFUSED: { value: 'SHIPPING_ADDRESS_REFUSED', description: 'Shipping Address Refused' },
    PRODUCT_UNAVAILABLE: { value: 'PRODUCT_UNAVAILABLE', description: 'Product Unavailable' },
    ERROR: { value: 'ERROR', description: 'Error' },
};
