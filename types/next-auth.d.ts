import NextAuth from 'next-auth';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth' {
    interface JWT {
        /** The user's role. */
        //  userRole?: "admin"

        id?: string | null;
        wallet?: string | null;
    }
    interface User {
        id?: string | null;
        wallet?: string | null;
    }
    interface Session {
        user?: {
            id?: string | null;
            email?: string | null;
            plan?: string | null;
            verified?: boolean | null;
            isPromoter?: boolean | null;
            is_promoter_active?: boolean | null;
            isAdmin?: boolean | null;
            config_db: boolean;
            wallet?: string | null;
            someExoticUserProperty?: string;
        } & DefaultSession['user'];
    }
}
