import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Controlla se l'utente è verificato
    if (!session || !session.verified) {
        // Fai il redirect alla pagina di verifica dell'email
        return NextResponse.redirect(new URL('/verify-email', req.url));
    }

    // Permetti l'accesso se l'utente è verificato
    return NextResponse.next();
}

// Configura il matcher per applicare il middleware solo a determinate rotte
export const config = {
  matcher: ['/', '/subscribe/:path*', '/my-orders/:path*', '/referral/:path*'],
};
