import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';
import { decryptData } from '../../utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase.from('config').select('*').limit(1).single();
            if (error) {
                console.log('🚀 ~ handler ~ error:', error);
            } else if (data) {
                res.status(200).json(data);
            } else {
                res.status(400).json({});
            }
        } catch (error) {
            console.log('🚀 ~ handler ~ error:', error);
            res.status(400).json({});
        }
    }
}
