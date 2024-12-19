import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Dati cablati per il test
    const COINBASE_API_KEY = '41d6ddf5-7404-4299-b925-12f0fe5aee16'; // Sostituisci con una chiave valida
    const COINBASE_BASE_URL = 'https://api.commerce.coinbase.com';
    const orderId = '1356-255469-5017'; // ID ordine statico
    const subtotalAmount = 10.0; // Importo statico

    console.log('🚀 ~ handler ~ Test: Static data being used');

    if (req.method !== 'POST') {
        console.log('🚀 ~ handler ~ Invalid method');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🚀 ~ handler ~ Creating charge on Coinbase with static data');
        const chargeResponse = await fetch(`${COINBASE_BASE_URL}/charges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CC-Api-Key': COINBASE_API_KEY,
                'X-CC-Version': '2018-03-22',
            },
            body: JSON.stringify({
                name: `Payment for Order ${orderId}`,
                description: `Payment for Order ${orderId}`,
                local_price: {
                    amount: subtotalAmount.toFixed(2),
                    currency: 'USD',
                },
                pricing_type: 'fixed_price',
                metadata: {
                    order_id: orderId,
                },
            }),
        });

        if (!chargeResponse.ok) {
            const errorData = await chargeResponse.json();
            console.log('🚀 ~ handler ~ Coinbase error response:', errorData);
            return res.status(500).json({ error: 'Failed to create payment link', details: errorData });
        }

        const chargeData = await chargeResponse.json();
        console.log('🚀 ~ handler ~ Coinbase response:', chargeData);

        return res.status(200).json({ hosted_url: chargeData.data.hosted_url });
    } catch (error: any) {
        console.error('🚀 ~ handler ~ Error:', error.message || error);
        return res.status(500).json({ error: 'Error creating payment link' });
    }
}
