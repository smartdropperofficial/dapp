import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';
import { decryptData } from '../../utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const encryptedOrderId = req.query.orderId;
            const orderId = decryptData(encryptedOrderId as string);

            if (encryptedOrderId) {
                const orderStatusResponse = await supabase
                    .from('orders')
                    .select(
                        'order_id, created_at, wallet_address, status, shipping_info, creation_tx, payment_tx, products, request_id, tax_request_id, tax_amount, subtotal_amount, total_amount'
                    )
                    .eq('order_id', orderId)
                    .single();
                // console.log('🚀 ~ handler ~ orderStatusResponse:', orderStatusResponse.data);

                if (orderStatusResponse.data) {
                    res.status(200).json(orderStatusResponse.data);
                } else {
                    res.status(400).json({});
                }
            } else {
                res.status(401).json({});
            }
        } catch {
            res.status(400).json({});
        }
    }
}
