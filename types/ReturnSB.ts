import { ProductSB } from "./OrderSB";
import { OrderReturnMethodAmazon, OrderReturnReasonAmazon } from "./OrderAmazon";

export interface ReturnSB {
	created_at?: string;
	order_id?: string;
	reason_code?: OrderReturnReasonAmazon;
	method_code?: OrderReturnMethodAmazon;
	reason_text?: string;
	products?: ProductSB[];
	status?: ReturnStatus;
	previous_status?: string[];
}

export enum ReturnStatus {
	CREATED = "CREATED",
	SENT_TO_AMAZON = "SENT_TO_AMAZON",
	RETURNED = "RETURNED",
	CANCELED = "CANCELED",
}