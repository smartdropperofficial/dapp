export interface Order {
  orderId: string;
  orderAmount: number;
  commission: number;
  shippingFee: number;
  buyer: string;
  orderClaimed: boolean;
  commissionClaimed: boolean;
  shippingFeeClaimed: boolean;
  orderRefunded: boolean;
}
