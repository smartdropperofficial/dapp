// Enum for differentiating between retailer and business subscription types.

import { BigNumber } from 'ethers';

export enum SubscriptionType {
    RETAILER,
    BUSINESS,
}

export enum SubscriptionPeriod {
    MONTHLY,
    ANNUAL,
}

// Define Structs in TypeScript
export interface PromoterModelSB {
    percentage: number;
    isActive: boolean;
    promoterAddress: string;
    profit: number;
    referralCode: string;
}

export interface SubscriptionPlansSB {
    id: number;
    subscriptionType: SubscriptionType;
    subscriptionPeriod: SubscriptionPeriod;
    name: string;
    price: number;
    promoPrice: number;
    period: number;
    enabled: boolean;
    fees: number;
    promoFees: number;
    isPromoActive: boolean;
    shopLimit: number;
}

export interface SubscriptionManagementSB {
    id: number;
    subscriber: string;
    promoterAddress: string;
    start: string;
    end: string;
    subscriptionType: SubscriptionType;
    subscriptionPeriod: SubscriptionPeriod;
    totAmountPaid: number;
    totShopAmountPaid: number;
    paymentTx: string;
    promoterProfit: number;
    promoterWithdrawn: boolean;
}
