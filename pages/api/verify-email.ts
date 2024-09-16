// pages/api/verify-email.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: 'Metodo non permesso, solo POST è supportato.' });
  }

  try {
    // Usa req.body per ottenere il token nella richiesta POST
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token mancante nella richiesta' });
    }

    console.log("🚀 ~ handler ~ token:", token);

    // Recupera i dati del token
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('Token non valido o scaduto:', error);
      return res.status(400).json({ error: 'Token non valido o scaduto' });
    }

    const { email, wallet_address } = data;

    // Verifica se esiste un utente con questa email
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Errore nel recupero dell’utente:', userError);
      return res.status(500).json({ error: 'Errore nel recupero dell’utente' });
    }

    if (!user) {
      // L'utente non esiste, crealo
      const { data: newUser, error: newUserError } = await supabase
        .from('users')
        .insert([{ email, email_verified: new Date() }])
        .single();

      if (newUserError) {
        console.error('Errore nella creazione dell’utente:', newUserError);
        return res.status(500).json({ error: 'Errore nella creazione dell’utente' });
      }
      user = newUser;
    }

    // Associa il wallet all'utente
    const { error: walletError } = await supabase
      .from('user_wallets')
      .insert([{ user_id: user.id, wallet_address }]);

    if (walletError && walletError.code !== '23505') {
      // Ignora l'errore di chiave duplicata
      console.error('Errore nell’associazione del wallet:', walletError);
      return res.status(500).json({ error: 'Errore nell’associazione del wallet' });
    }

    // Elimina il token usato
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    return res.status(200).json({ message: 'Email verificata e wallet associato con successo' });
  } catch (error) {
    console.error('Errore nel processo di verifica dell\'email:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
