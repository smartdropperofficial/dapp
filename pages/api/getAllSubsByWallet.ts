import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';
import { decryptData } from '../../utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const encryptedWallet = req.query.wallet;
            console.log('🚀 ~ handler ~ encryptedWallet:', encryptedWallet);
            const wallet = decryptData(encryptedWallet as string);
            console.log('🚀 ~ handler ~ wallet:', wallet);

            if (wallet) {
                // Chiamata alla funzione SQL creata
                const { data, error } = await supabase.rpc('get_subscriptions_with_plans_by_wallet', { in_wallet: wallet });

                if (error) {
                    console.error('Errore nella chiamata alla funzione:', error);
                    return res.status(400).json({ error: 'Errore nella chiamata alla funzione.' });
                }

                if (data) {
                    console.log('🚀 ~ handler ~ data:', data);
                    res.status(200).json(data);
                } else {
                    res.status(400).json({});
                }
            } else {
                res.status(401).json({});
            }
        } catch (err) {
            console.error("Eccezione nell'handler:", err);
            res.status(400).json({});
        }
    } else {
        res.status(405).json({ error: 'Metodo non permesso' });
    }
}
