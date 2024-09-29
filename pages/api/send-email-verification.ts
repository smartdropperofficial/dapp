// pages/api/send-email-verification.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, walletAddress } = req.body;
  console.log("🚀 ~ handler ~  req.body:",  req.body)

  // Genera un token di verifica
  const token = uuidv4();

  // Salva il token, l'email e il wallet in una tabella temporanea
  const { error } = await supabase
    .from('email_verification_tokens')
    .insert([{ email, wallet_address: walletAddress, token }]);

  if (error) {
    console.error('Errore nel salvataggio del token di verifica:', error);
    return res.status(500).json({ error: 'Errore nel salvataggio del token di verifica' });
  }

  // Invia l'email con il link di verifica
  const verifyUrl = `${process.env.NEXTAUTH_URL}/link-email?token=${token}`;

  try {
    const response = await axios.post(`${process.env.MAILER_WEBHOOK}/send-login-email`, {
      email: email,
      url: verifyUrl,
    });

    if (response.status !== 200) {
      throw new Error(`Errore nell'invio dell'email: ${response.statusText}`);
    }
    res.status(200).json({ message: 'Email di verifica inviata' });
  } catch (error) {
    console.error('Errore nell’invio dell’email di verifica:', error);
    res.status(500).json({ error: 'Errore nell’invio dell’email di verifica' });
  }
}
