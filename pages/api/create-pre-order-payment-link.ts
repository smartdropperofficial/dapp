import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export interface CreateChargeResponse {
    hosted_url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY;
    const COINBASE_BASE_URL = 'https://api.commerce.coinbase.com';
    console.log('🚀 ~ handler ~ COINBASE_API_KEY:', COINBASE_API_KEY);
    console.log('🚀 ~ handler ~ COINBASE_BASE_URL:', COINBASE_BASE_URL);

    if (req.method !== 'POST') {
        console.log('🚀 ~ handler ~ Invalid method');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id } = req.body;
    console.log('🚀 ~ handler ~ order_id:', order_id);

    if (!order_id) {
        console.log('🚀 ~ handler ~ Missing order ID');
        return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!COINBASE_API_KEY) {
        console.log('🚀 ~ handler ~ Missing Coinbase API key');
        return res.status(500).json({ error: 'Coinbase API key is missing' });
    }

    try {
        console.log('🚀 ~ handler ~ Fetching order from Supabase');
        const { data: order, error } = await supabase.from('orders').select('subtotal_amount').eq('id', order_id).single();

        if (error || !order) {
            console.log('🚀 ~ handler ~ Order not found:', error);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('🚀 ~ handler ~ Order details:', order);

        console.log('🚀 ~ handler ~ Creating charge on Coinbase');
        const chargeResponse = await fetch(`${COINBASE_BASE_URL}/charges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': COINBASE_API_KEY,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify({
                name: `Payment for Order ${order_id}`,
                description: `Payment for Order ${order_id}`,
                local_price: {
                    amount: order.subtotal_amount.toFixed(2),
                    currency: 'USD',
                },
                pricing_type: 'fixed_price',
                metadata: {
                    order_id,
                },
            }),
        });

        if (!chargeResponse.ok) {
            const errorData = await chargeResponse.json();
            console.log('🚀 ~ handler ~ Coinbase error response:', errorData);
            return res.status(500).json({ error: 'Failed to create payment link', details: errorData });
        }

        const chargeData: CreateChargeResponse = await chargeResponse.json();
        console.log('🚀 ~ handler ~ Coinbase response:', chargeData);

        return res.status(200).json({ hosted_url: chargeData.hosted_url });
    } catch (error: any) {
        console.error('🚀 ~ handler ~ Error:', error.message || error);
        return res.status(500).json({ error: 'Error creating payment link' });
    }
}
