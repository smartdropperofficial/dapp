export interface SellerSelectionCriteria {
	prime: boolean;
	handling_days_max: number;
	condition_in: string[];
}

export interface ProductAmazon {
	product_id: string;
	quantity: number;
	seller_selection_criteria?: SellerSelectionCriteria;
}

export interface ShippingAddress {
	first_name: string;
	last_name: string;
	address_line1: string;
	address_line2: string;
	zip_code: string;
	city: string;
	state: string;
	country: string;
	phone_number: string;
}

export interface PaymentMethod {
	name_on_card: string;
	number: string;
	security_code: string;
	expiration_month: number;
	expiration_year: number;
	use_gift: boolean;
}

export interface RetailerCredentials {
	email: string;
	password: string;
	totp_2fa_key: string;
}

export interface Webhooks {
	request_succeeded: string;
	request_failed: string;
	tracking_obtained: string;
}

export interface ClientNotes {
	our_internal_order_id: string;
	any_other_field: string[];
}

export interface ShippingCriteria {
	order_by: string;
	max_days: number;
	max_price: number;
}

export interface OrderAmazon {
	idempotency_key: string;
	addax: boolean;
	retailer: string;
	products: AmazonProduct[];
	max_price: number;
	shipping_address: ShippingAddress;
	is_gift: boolean;
	gift_message?: string;
	shipping: ShippingCriteria;
	shipping_method?: string;
	payment_method?: PaymentMethod;
	retailer_credentials?: RetailerCredentials;
	webhooks?: Webhooks;
	client_notes?: ClientNotes;
}

export interface OrderReturnAmazon {
	products: ProductAmazon[];
	reason_code: OrderReturnReasonAmazon;
	method_code: OrderReturnMethodAmazon;
	explanation: string;
	requestId?: string;
}

export enum OrderReturnReasonAmazon {

	ITEM_DEFECTIVE_OR_DOESENT_WORK = "Item defective or doesn't work",
	PRODUCT_AND_SHIPPING_BOX_BOTH_DAMAGED = "Product and shipping box both damaged",
	RECEIVED_EXTRA_ITEM_I_DIDNT_BUY = "Received extra item I didn't buy (no refund needed)",
	WRONG_ITEM_WAS_SENT = "Wrong item was sent",
	MISSING_OR_BROKEN_PARTS = "Missing or broken parts",
	BETTER_PRICE_AVAILABLE = "Better price available",
	INACCURATE_WEBSITE_DESCRIPTION = "Inaccurate website description",
	NO_LONGER_NEEDED = "No longer needed",
	PRODUCT_DAMAGED_BUT_SHIPPING_BOX_OK = "Product damaged, but shipping box ok",
	BOUGHT_BY_MISTAKE = "Bought by mistake",
	ITEM_ARRIVED_TOO_LATE = "Item arrived too late",
	DIDNT_APPROVE_PURCHASE = "Didn't approve purchase"


}

export enum OrderReturnMethodAmazon {
	UPS_DROPOFF = "UPS Dropoff",
}

export interface AmazonProduct {
	price: number;
	seller_id: string;
	product_id: string;
	quantity: number;
}

export interface PriceComponents {
	converted_payment_total: number;
	tax: number;
	product_subtotals: any;
	payment_currency: string;
	currency: string;
	products: AmazonProduct[];
	shipping: number;
	total: number;
	subtotal: number;
}

export interface TaxInfoAmazon {
	order_response?: any;
	price_components: PriceComponents;
	current_url?: any;
	max_price: number;
}
