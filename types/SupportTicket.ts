interface SupportTicket {
    id: string; // UUID string
    order_id: string; // TEXT, assuming it's a string format
    user_wallet_address: string; // VARCHAR(255)
    subject: string; // VARCHAR(255)
    status: string; // VARCHAR(50)
    created_at: Date; // TIMESTAMP WITH TIME ZONE
    updated_at: Date; // TIMESTAMP WITH TIME ZONE
}
