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
     BASKET = "BASKET",
     CREATED = "CREATED",
     WAITING_TAX = "WAITING_TAX",
     WAITING_PAYMENT = "WAITING_PAYMENT",
     PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
     SENT_TO_AMAZON = "SENT_TO_AMAZON",
     RETURNED_TO_AMAZON = "RETURNED_TO_AMAZON",
     RETURNED = "RETURNED",
     CANCELED = "CANCELED",
     COMPLETED = "COMPLETED",
     SHIPPING_ADDRESS_REFUSED = "SHIPPING_ADDRESS_REFUSED",
     PRODUCT_UNAVAILABLE = "PRODUCT_UNAVAILABLE",
     ERROR = "ERROR",
     INSUFFICIENT_ZMA_BALANCE = "INSUFFICIENT_ZMA_BALANCE",
}
