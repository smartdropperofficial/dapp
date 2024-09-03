import { NextApiRequest, NextApiResponse } from 'next';

const url = 'https://api.commerce.coinbase.com/charges';

const requestBody = (amount: number, currency: string, name?: string, description?: string, metadata?: any, redirectUrl?: string) => ({
    local_price: {
        amount,
        currency,
    },
    pricing_type: 'fixed_price',
    name,
    description,
    redirect_url: redirectUrl,
    metadata,
});

const payload = (apiKey: string, body: any) => ({
    method: 'POST',
    mode: 'cors' as RequestMode,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
    },
    body: JSON.stringify(body),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { amount, currency, name, description, metadata, redirectUrl } = req.body;
        console.log("🚀 ~ handler ~ redirectUrl:", redirectUrl)
        console.log("🚀 ~ handler ~ metadata:", metadata)
        console.log("🚀 ~ handler ~ description:", description)
        console.log("🚀 ~ handler ~ name:", name)
        console.log("🚀 ~ handler ~ currency:", currency)
        console.log("🚀 ~ handler ~ amount:", amount)
        console.log("🚀 ~ handler ~ url:", url)
        //TODO: get orderId from req.body here
        console.log("🚀 ~ handler ~ process.env.COINBASE_API_KEY:", process.env.COINBASE_API_KEY)
        try {
            const response = await fetch(
                url,
                payload(process.env.COINBASE_API_KEY as string, requestBody(amount, currency, name, description, metadata, redirectUrl))
            );
            if (!response.ok) {
                throw new Error(`HTTP error Status: ${response.status}`);
            }
            const chargeData = await response.json();
            console.log("🚀 ~ handler ~ chargeData:", chargeData)

            //TODO save on SP database   
            res.status(200).json(chargeData);
        } catch (error) {
            console.error('Error creating charge:', error);
            res.status(500).json({ error: (error as Error).message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
