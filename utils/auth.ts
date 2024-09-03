import { getToken } from 'next-auth/jwt';
import { NextApiRequest, NextApiResponse } from 'next';

export const withAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        console.log('🚀 ~ withAuth ~ req:', req);

        const token = await getToken({ req, secret: process.env.SECRET });
        console.log('🚀 ~ return ~ token:', token);

        if (!token || token.verified === false) {
            res.redirect('/verify-email');
            return;
        }
        console.log('🚀 ~ return ~ token:', token);

        await handler(req, res);
    };
};

// Client-side checkAuth function
export const checkAuthClient = async () => {
    const response = await fetch('/api/check-auth');
    console.log('🚀 ~ checkAuthClient ~ response:', response);
    if (!response.ok) {
        throw new Error('Failed to check auth');
    }
    const result = await response.json();
    return result;
};
