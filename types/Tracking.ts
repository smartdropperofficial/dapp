export interface Tracking {
	merchant_order_id?: string;
	carrier?: string;
	tracking_number?: string;
	delivery_status?: string;
	product_ids?: string[];
	tracking_url?: string;
	retailer_tracking_number?: string;
	retailer_tracking_url?: string;
	obtained_at?: string;
}
