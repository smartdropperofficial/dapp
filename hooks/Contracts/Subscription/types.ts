// Enum for differentiating between retailer and business subscription types.

import { BigNumber } from 'ethers';

export enum SubscriptionType {
    RETAILER = 0,
    BUSINESS = 1,
}

export enum SubscriptionPeriod {
    MONTHLY = 0,
    ANNUAL = 1,
}

// Define Structs in TypeScript
export interface PromoterModel {
    percentage: number;
    isActive: boolean;
    promoterAddress: string;
    profit: number;
    referralCode: string;
}

export interface SubscriptionPlans {
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

export interface SubscriptionManagementModel {
    id?: number;
    subscriber?: string;
    promoterAddress?: string;
    start?: string;
    end?: string;
    subscriptionModel: SubscriptionPlans;
    totAmountPaid?: number;
    totShopAmountPaid?: number;
    paymentTx?: string;
    promoterProfit?: number;
    promoterWithdrawn?: boolean;
}
