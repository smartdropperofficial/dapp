import type { NextApiRequest, NextApiResponse } from 'next';

import { decryptData } from '../../utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const encryptedTaxRequestId = req.query.taxRequestId;
            const amazon_api = req.query.amazon_api;
            // console.log("🚀 ~  api/getAmountToPay ~ encryptedTaxRequestId:", encryptedTaxRequestId);
            const taxRequestId: string = decryptData(encryptedTaxRequestId as string);
            console.log('🚀 ~  api/getAmountToPay ~ taxRequestId:', taxRequestId);

            // const concatenatedString = process.env.NEXT_PUBLIC_ZINC_API_KEY!;

            if (taxRequestId) {
                const headers = new Headers();
                // headers.append("Authorization", `Basic ${base64EncodedString}`);
                // headers.append("Content-Type", "application/json");
                headers.append('Authorization', `Basic ${Buffer.from(`${amazon_api}:`).toString('base64')}`);

                headers.append('Content-Type', 'application/json');

                const response = await fetch(`${process.env.ORDER_API_URL}/orders/${taxRequestId}`, {
                    method: 'GET',
                    headers: headers,
                });
                const amazonResponse: any = await response.json();
                console.log('🚀 ~ api/getAmountToPay ~ amazonResponse.code:', amazonResponse);
                if (amazonResponse.code === 'max_price_exceeded') {
                    // console.log("🚀 ~   api/getAmountToPay ~ amazonResponse.code:max_price_exceeded", amazonResponse.code);
                    res.status(200).json({
                        tax: amazonResponse.data.price_components.tax / 100,
                        subtotal: amazonResponse.data.price_components.subtotal / 100,
                        total: amazonResponse.data.price_components.total / 100,
                        products: amazonResponse.data.price_components.products,
                        shipping: amazonResponse.data.price_components.shipping / 100,
                    });
                } else {
                    // console.log("🚀 ~  api/getAmountToPay ~ amazonResponse.code:", amazonResponse.code);
                    res.status(200).json({ error: amazonResponse.code });
                }
            } else {
                console.error('🚀 ~  api/getAmountToPay ~ taxRequestId: Tax Request Id not found', taxRequestId);
                res.status(401).json({ error: 'Tax Request Id not found' });
            }
        } catch {
            res.status(400).json({});
        }
    }
}
