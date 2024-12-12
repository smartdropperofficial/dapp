import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const subscriptionId = req.query.subscriptionId;
            console.log('🚀 ~ handler ~ subscriptionId:', subscriptionId);

            if (subscriptionId) {
                // Chiama la funzione SQL is_budget_exceeded
                const { data, error } = await supabase.from('subscription').select('budget_left').eq('subscription_id', subscriptionId.toString());

                if (error) {
                    console.error('Error calling is_budget_exceeded:', error);
                    res.status(400).json({ error: 'Failed to execute function' });
                    return;
                }

                res.status(200).json({ data });
            } else {
                res.status(400).json({ error: 'Missing subscription ID' });
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
