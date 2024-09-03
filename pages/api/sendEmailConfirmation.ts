import { NextApiRequest, NextApiResponse } from 'next';
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method === 'POST') {
    try {
      const encryptedcode = req.body;    
      console.log("🚀 ~ handler ~ encryptedcode:", encryptedcode);
      
      const decryptbody = JSON.parse(decryptData(encryptedcode as string));
      console.log("🚀 ~ handler ~ decryptbody:", decryptbody);

      const headers = {
        'Content-Type': 'application/json',
        'authorization': "Bearer " + process.env.MAILER_TOKEN!
      };
      const url = `${process.env.MAILER_WEBHOOK!}/mailverification`
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(decryptbody), // Devi convertire decryptbody in una stringa JSON prima di inviarlo come corpo della richiesta
      });  

      console.log("🚀 ~ handler ~ response:", response.status);

      if (response.ok) {
        const data = await response;
        return res.status(200).json(data);
      } else {
        return res.status(response.status).json({ error: 'External service error.' });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
