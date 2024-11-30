import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Imposta questa chiave nelle variabili d'ambiente

    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await fetch(verifyURL, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, error: data['error-codes'] });
    }
}
