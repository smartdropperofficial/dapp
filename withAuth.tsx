import { getSession, GetSessionParams } from 'next-auth/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { SessionExt } from '@/types/SessionExt';

type RedirectCondition = (session: SessionExt, context: GetServerSidePropsContext) => { destination: string, permanent: boolean } | null;

const globalConditions: RedirectCondition[] = [
    (session: SessionExt) => {
        if (session.verified === false) {
            return { destination: '/verify-email', permanent: false };
        }
        return null;
    },

    (session: SessionExt) => {
        if (!session.address || !session) {
            return { destination: '/login', permanent: false };
        }
        return null;
    },
];

const redirectConditions: { [key: string]: RedirectCondition[] } = {
    '/admin': [
        (session: SessionExt) => {
            if (!session.isAdmin) {
                return { destination: '/', permanent: false };
            }
            return null;
        },
    ],

    '/my-orders': [
        (session: SessionExt) => {
            if (!session.address) {
                return { destination: '/login', permanent: false };
            }
            return null;
        },
    ],

    // Adding the rule for '/sub' and all its subpaths
    '^/sub/.*': [
        (session: SessionExt) => {
            if (!session.isAdmin) {
                return { destination: '/', permanent: false };
            }
            return null;
        },
    ],
};

export function withAuth<P>(
    getServerSidePropsFunc?: (
        context: GetServerSidePropsContext
    ) => Promise<GetServerSidePropsResult<P>>
) {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const { req, resolvedUrl } = context;
        const session = await getSession({ req: req as GetSessionParams['req'] });
        console.log("🚀 ~ session:", session);

        if (!session) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }
        if (!session.user?.email) {
            return {
                redirect: {
                    destination: '/verify-email',
                    permanent: false,
                },
            };
        }

        const sessionExt: SessionExt = {
            ...session,
            email: session.user.email,
            isAdmin: false,
            config_db: false,
        };

        const user = await getUser(sessionExt.address || '');
        if (user) {
            sessionExt.isAdmin = user.is_admin;
            sessionExt.isPromoter = user.is_promoter;
            sessionExt.is_promoter_active = user.is_promoter_active;
            sessionExt.config_db = user.config;
            sessionExt.verified = user.is_verified;
        }

        const conditions = [
            ...globalConditions,
            ...Object.keys(redirectConditions)
                .filter(key => new RegExp(key).test(resolvedUrl))
                .flatMap(key => redirectConditions[key])
        ];

        for (const condition of conditions) {
            const redirect = condition(sessionExt, context);
            if (redirect) {
                return { redirect };
            }
        }

        const gsspResult = getServerSidePropsFunc ? await getServerSidePropsFunc(context) : { props: {} as P };

        if ('props' in gsspResult) {
            return {
                ...gsspResult,
                props: {
                    ...gsspResult.props,
                    session: sessionExt,
                },
            };
        }

        return gsspResult;
    };
}

async function getUser(wallet: string) {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('email,is_verified,is_promoter,is_admin,config,is_promoter_active')
            .eq('wallet_address', wallet)
            .single();

        if (error) {
            console.log('🚀 ~ getUserRole ~ error:', error);
        }
        return user || null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
