// pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import axios from 'axios';
import { supabase } from '../../../utils/supabaseClient';

export default async function auth(req: any, res: any) {
  const providers = [
    // Provider per Ethereum (SIWE)
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text', placeholder: '0x0' },
        signature: { label: 'Signature', type: 'text', placeholder: '0x0' },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));
          const nextAuthUrl = process.env.NEXTAUTH_URL;
          if (!nextAuthUrl) {
            throw new Error('NEXTAUTH_URL non è definita nelle variabili d’ambiente');
          }
          console.log("🚀 ~ authorize ~ nextAuthUrl:", nextAuthUrl)
          
          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: nextAuthUrl,
            nonce: await getCsrfToken({ req }),
          });

          if (result.success) {
            const walletAddress = siwe.address;
            console.log("Verifica se il wallet è già associato a un'email");
            const user = await getUserByWalletAddress(walletAddress);
            console.log("🚀 ~ authorize ~ user:", user);

            if (user) {
              console.log("User trovato:", { id: siwe.address, ...user });
              return { sub: siwe.address, ...user };
            } else {
              console.log("Nessun utente trovato, email necessaria:", { id: siwe.address, needsEmail: true });
              return { sub: siwe.address, needsEmail: true };
            }
          }
          return null;
        } catch (error) {
          console.error('Errore in authorization:', error);
          return null;
        }
      },
    }),
    // Provider per Email
    // EmailProvider({
    //   server: '', // Non necessario se usi la tua API per inviare le email
    //   from: 'noreply@example.com',
    //   maxAge: 60 * 10, // Il token di verifica scade dopo 10 minuti
    //   sendVerificationRequest: async ({ identifier, url }) => {
    //     try {
    //       // Chiamata alla tua API per inviare l'email di verifica
    //       const response = await axios.post('http://localhost/send-login-email', {
    //         email: identifier,
    //         url: url,
    //       });

    //       if (response.status !== 200) {
    //         throw new Error(`Errore nell'invio dell'email: ${response.statusText}`);
    //       }
    //     } catch (error) {
    //       console.error('Errore durante l’invio della richiesta di verifica:', error);
    //       throw new Error('Errore nell’invio dell’email di verifica');
    //     }
    //   },
    // }),
  ];

  const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin');

  if (isDefaultSigninPage) {
    // Rimuovi il provider Ethereum dalla pagina di login predefinita
    providers.pop();
  }

  return await NextAuth(req, res, {
    providers,
    adapter: SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    session: {
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60, // Sessione valida per 7 giorni 
    },
    secret: process.env.NEXTAUTH_SECRET!,
    pages: {
      signIn: '/login', // Pagina di login personalizzata
      // Rimosso newUser: '/link-email' per gestire il redirect nel frontend
    },
    callbacks: {
      async signIn({ user, account }: { user: any; account: any }) {     
        if (account?.provider === 'credentials' && user?.needsEmail) {
             user.isNewUser = true; // Imposta un flag personalizzato
        }
        return true; // Consenti comunque il login
      },
      
      async jwt({ token, user }: { token: any; user: any }) { 
        console.log("🚀 ~ jwt ~ user:", user)

        if (user) { 
          token.address = user.sub;  // Aggiungi l'ID del wallet al token
          token.email = user.email;
          token.verified = user.email_verified;
          token.config = user.config;       
          token.needsEmail = user.needsEmail || false;
        }
        return token;
      },

      async session({ session, token }: { session: any; token: any }) {
        if (token) {
          console.log("🚀 ~ session ~ token:", token);          
          session.address = token.address;
          session.email = token.email;
          session.verified = token.verified;
          session.config_db = token.config;
          session.needsEmail = token.needsEmail;
          console.log("🚀 ~ session :", session);
        }
        return session;
      },

     
    },
  });
}

async function getUserByWalletAddress(walletAddress: string) {
  try {
    const { data: userWallet, error } = await supabase
      .from('user_wallets')
      .select(`
        wallet_address,
        user:users!inner (
          id,
          email,
          email_verified,config
        )
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (error || !userWallet) {
      console.log("🚀 ~ getUserByWalletAddress ~ errore:", error);
      return null;
    }

    console.log("🚀 ~ getUserByWalletAddress ~ userWallet:", userWallet);

    const user = userWallet.user;

    return {
      ...user,
      address: walletAddress,
    };
  } catch (error) {
    console.error('Errore in getUserByWalletAddress:', error);
    return null;
  }
}
