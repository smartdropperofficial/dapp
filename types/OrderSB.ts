import { OrderStatus } from "./Order";

export interface OrderSB {
     order_id?: string;
     created_at?: string;
     wallet_address?: string;
     country?: string;
     status?: OrderStatus;
     shipping_info?: ShippingInfoSB;
     products?: ProductSB[];
     request_id?: string;
     payment_tx?: string;
     unlock_tx?: string;
     return_tx?: string;
     creation_tx?: string;
     tax_request_id?: string;
     tax_amount?: number;
     subtotal_amount?: number;
     total_amount?: number;
     amount_paid?: number;
     previous_status?: string[];
     shipping_amount?: number;
     refund?: RefundSB[];
     user_id?: number | null | undefined;
     commission?: number;
     email?: string;
     currency?: string;
     retailer?: string;
     ticket_id?: string;  // Aggiunta dei ticket di supporto
}

export interface TicketSB {
     id: string;
     subject: string;
     status: string;
     created_at: string;
}

export interface RefundSB {
     asin: string;
     transaction: string;
}
export interface MessageSB {
     id?: string;  // UUID per identificare univocamente ogni messaggio
     sender_wallet_address: string;  // Indirizzo del wallet del mittente
     receiver_wallet_address: string;  // Indirizzo del wallet del destinatario
     ticket_id: string;  // ID del ticket associato al messaggio
     content: string;  // Contenuto del messaggio
     msg_timestamp: string;  // Timestamp del messaggio
     read: boolean;  // Indica se il messaggio è stato letto
     status: string;  // Stato del messaggio (es: "sent", "received", etc.)
}


export interface ShippingInfoSB {
     first_name: string;
     last_name: string;
     address_line1: string;
     address_line2: string;
     zip_code: string;
     city: string;
     state: string;
     phone_number: string;
     email: string;
}

export interface ProductSB {
     asin: string;
     image: string;
     price: number;
     symbol: string;
     title: string;
     url: string;
     quantity: number;
}
