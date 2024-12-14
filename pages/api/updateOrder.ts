import type { NextApiRequest, NextApiResponse } from 'next';
import { OrderSB } from '../../types/OrderSB';
import { supabase } from '../../utils/supabaseClient';
import { decryptData } from '../../utils/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PATCH') {
        try {
            const orderEncrypted = req.body;
            const orderBody = JSON.parse(decryptData(orderEncrypted as string));
            console.log('🚀 ~ handler ~ api/updateOrder - orderBody:', orderBody);

            if (orderBody) {
                const order: OrderSB = orderBody.order;
                const orderId = orderBody.orderId;

                // Aggiorna l'ordine nel database
                const { data, error } = await supabase
                    .from('orders') // Assicurati che 'orders' sia il nome corretto della tua tabella
                    .update(order)
                    .eq('id', orderId);

                if (error) {
                    console.error("Errore durante l'aggiornamento dell'ordine:", error);
                    return res.status(500).json({ error: "Errore durante l'aggiornamento dell'ordine." });
                }

                return res.status(200).json({ message: 'Ordine aggiornato con successo.', data });
            } else {
                return res.status(400).json({ error: 'Il corpo della richiesta è vuoto.' });
            }
        } catch (error) {
            console.error('Errore interno del server:', error);
            return res.status(500).json({ error: 'Errore interno del server.' });
        }
    } else {
        return res.status(405).json({ error: 'Metodo non consentito.' });
    }
}
