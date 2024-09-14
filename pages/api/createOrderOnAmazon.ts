import type { NextApiRequest, NextApiResponse } from 'next';
import { OrderAmazon } from '../../types/OrderAmazon';
import { decryptData } from '../../utils/utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const encryptedPayload = req.body;
            const payload = JSON.parse(decryptData(encryptedPayload as string));
            console.log('🚀 ~ handler ~ order:', payload?.order!);
            console.log('🚀 ~ handler ~ amazon_api:', payload?.amazon_api!);

            if (payload) {
                const zincOrderObject = generateAmazonOrderObject(payload?.order!);
                console.log('🚀 ~ handler ~ JSON.stringify(zincOrderObject):', JSON.stringify(zincOrderObject!));

                const headers = new Headers();
                //  headers.append('Authorization', `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZINC_API_KEY!}:`).toString('base64')}`);
                headers.append('Authorization', `Basic ${Buffer.from(`${payload?.amazon_api!}:`).toString('base64')}`);

                headers.append('Content-Type', 'application/json');

                const response = await fetch(`${process.env.ORDER_API_URL}/orders`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(zincOrderObject!),
                });

                const zincResponse: any = await response.json();
                console.log('🚀 ~ handler ~ zincResponse:', zincResponse!);

                if (zincResponse._type === 'error') {
                    res.status(400).json({});
                } else {
                    res.status(201).json(zincResponse!);
                }
            } else {
                res.status(401).json({});
            }
        } catch {
            res.status(400).json({});
        }
    }
}

const generateAmazonOrderObject = (payload: any): OrderAmazon | null => {
    try {
        return {
            idempotency_key: payload.orderId,
            retailer: 'amazon',
            addax: true,
            products: payload.products,
            max_price: 0,

            shipping_address: {
                first_name: payload.shipping_address.firstName,
                last_name: payload.shipping_address.lastName,
                address_line1: payload.shipping_address.addressLine1,
                address_line2: payload.shipping_address.addressLine2,
                zip_code: payload.shipping_address.zipCode,
                city: payload.shipping_address.city,
                state: payload.shipping_address.state,
                country: 'US',
                phone_number: payload.shipping_address.phoneNumber,
            },
            webhooks: {
                request_succeeded:  `${process.env.MAILER_WEBHOOK!}/request-succeeded`,
                request_failed:  `${process.env.MAILER_WEBHOOK!}/request-failed`,
                tracking_obtained: `${process.env.MAILER_WEBHOOK!}/tracking`,
            },
            shipping: {
                order_by: 'price',
                max_days: 10,
                max_price: 1000,
            },
            is_gift: false,
        };
    } catch (error) {
        console.log('🚀 ~ generateAmazonOrderObject ~ error:', error);
        return null;
    }
};
