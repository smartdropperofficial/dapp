// lib/withAuth.tsx
import { getSession, useSession } from 'next-auth/react';
import { SessionExt } from './types/SessionExt';

export function withAuth(gssp: any) {
    // const { data: session }: { data: SessionExt | null; status: string } = useSession() as { data: SessionExt | null; status: string };

    return async (context: any) => {
        const session: SessionExt | null = (await getSession(context)) as SessionExt | null;
        console.log('🚀 ~ withAuth ~ session:', session);

        if (!session) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        if (session && session?.verified === false) {
            return {
                redirect: {
                    destination: '/link-email',
                    permanent: false,
                },
            };
        }

        return await gssp(context, session);
    };
}
