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

// export interface SubscriptionManagementSB {
//     id: number;
//     subscriber: string;
//     promoterAddress: string;
//     start: string;
//     end: string;
//     subscriptionType: SubscriptionType;
//     subscriptionPeriod: SubscriptionPeriod;
//     totAmountPaid: number;
//     totShopAmountPaid: number;
//     paymentTx: string;
//     promoterProfit: number;
//     promoterWithdrawn: boolean;
// }
export interface SubscriptionManagementModel {
    id: number;
    createdAt: string;
    subscriber: string | null;
    promoterAddress: string | null;
    start: string | null;
    end: string | null;
    subscriptionType: number;
    paymentTx: string | null;
    promoterWithdrawn: boolean | null;
    subscriptionTx: string | null;
    promoterWithdrawnTx: string | null;
    budgetLeft: number | null;
    monthlyBudget: number | null;
    planId: number | null;
    subscriptionId: string | null;
}
