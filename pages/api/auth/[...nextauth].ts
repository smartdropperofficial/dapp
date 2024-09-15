import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import axios from 'axios';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: '', // Non necessario poiché usi la tua API per inviare le email
      from: 'noreply@example.com', 
      maxAge: 60 * 10,  // Token di verifica valido per 10 minuti
      sendVerificationRequest: async ({ identifier, url }) => {
        try {
          // Chiamata alla tua API per inviare l'email di verifica
          const response = await axios.post('http://localhost/send-login-email', {
            email: identifier,
            url: url,
          });

          if (response.status !== 200) {
            throw new Error(`Errore nell'invio dell'email: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Errore durante l’invio della richiesta di verifica:', error);
          throw new Error('Errore nell’invio dell’email di verifica');
        }
      },
    }),
  ], 
  pages: {
    signIn: '/login' // Personalizza la pagina di login
    // error: '/auth/error',    // Personalizza la pagina di errore
    // verifyRequest: '/auth/verify-request',  // Quando viene inviata l'email di verifica
    // newUser: null,  // Impostalo a `null` se non vuoi una pagina di reindirizzamento per i nuovi utenti
  },

  // Rimuovi l'opzione `schema`
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // Validità del token: 7 giorni
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, user }) {
      console.log("🚀 ~ jwt ~ user:", user)
      // Quando l'utente viene autenticato per la prima volta
      if (user) {
        token.email = user.email;  
        token.id = user.id;  
        token.verified = user.emailVerified ;  
        token.config = user.config; 
        console.log("🚀 ~ jwt ~ token:", token)
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.id = token.id;
        session.email = token.email;
        session.verified = token.verified;
        session.config_db = token.config;
      } 
      console.log("🚀 ~ session ~ session:", session)

      return session;
    },
  },
};

export default NextAuth(authOptions);
