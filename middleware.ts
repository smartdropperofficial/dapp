import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSession } from 'next-auth/react';

export async function middleware(req: NextRequest) {
    const token = await getToken({req});

    // Controlla se l'utente è verificato
    if (token && token?.verified ===  false) {
        return NextResponse.redirect(new URL('/link-email', req.url));
    } 
  //   if (!token ) {
  //     return NextResponse.redirect(new URL('/login', req.url));
  // }

    // Permetti l'accesso se l'utente è verificato
    return NextResponse.next();
}

// Configura il matcher per applicare il middleware solo a determinate rotte
export const config = {
  matcher: ['/', '/subscribe/:path*', '/my-orders/:path*', '/referral/:path*'],
};
