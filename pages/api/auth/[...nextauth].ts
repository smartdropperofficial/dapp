import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';
import { supabase } from '../../../utils/supabaseClient';

export default async function auth(req: any, res: any) {
    const providers = [
        CredentialsProvider({
            name: 'Ethereum',
            credentials: {
                message: {
                    label: 'Message',
                    type: 'text',
                    placeholder: '0x0',
                },
                signature: {
                    label: 'Signature',
                    type: 'text',
                    placeholder: '0x0',
                },
            },
            async authorize(credentials) {
                try {
                    const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));
                    const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);
                    console.log('🚀 ~ authorize ~ nextAuthUrl:', nextAuthUrl);

                    const result = await siwe.verify({
                        signature: credentials?.signature || '',
                        domain: nextAuthUrl.host,
                        nonce: await getCsrfToken({ req }),
                    });

                    if (result.success) {
                        // const userRole = await getUserRole(siwe?.address); // Fetch user role from database
                        return {
                            id: siwe.address,
                            //role: userRole,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error in authorization:', error);
                    return null;
                }
            },
        }),
    ];

    const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin');

    if (isDefaultSigninPage) {
        providers.pop();
    }

    return await NextAuth(req, res, {
        providers,
        session: {
            strategy: 'jwt',
        },
        secret: process.env.NEXTAUTH_SECRET!,
        callbacks: {
            async session({ session, token }: { session: any; token: any }) {
                if (token) {
                    const userRole = await getUserRole(token.sub);
                    if (userRole) {
                        token.email = userRole?.email;
                        token.verified = userRole?.is_verified;
                        token.isPromoter = userRole?.is_promoter;
                        token.is_promoter_active = userRole?.is_promoter_active;
                        token.isAdmin = userRole?.is_admin;
                        token.config_db = userRole?.config;
                    }
                }

                session.address = token.sub;
                session.email = token?.email; // Add user email to session
                session.verified = token?.verified; // Add user email to session
                session.isPromoter = token?.isPromoter; // Add user email to session
                session.is_promoter_active = token?.is_promoter_active;
                session.isAdmin = token?.isAdmin; // Add user email to session
                session.config_db = token?.config_db; // Add user email to session
                // console.log("🚀 ~ session ~ session:", session)

                return session;
            },
        },
    });
}

async function getUserRole(wallet: string | undefined) {
    try {
        let { data: user, error } = await supabase
            .from('users')
            .select('email,is_verified,is_promoter,is_admin,is_promoter_active,config')
            .eq('wallet_address', wallet)
            .single();

        if (error) {
            console.log('🚀 ~ getUserRole ~ error:', error);
        }

        if (!user) {
            const { data: configData, error: configError } = await supabase.from('config').select('*').eq('is_on', true);
            console.log("🚀 ~ getUserRole ~ configData:", configData)

            if (configError) {
                console.error('🚀 Error fetching config:', configError);
            } else {
                if (configData && configData.length > 1) {
                    const { data: lastInsertedRecord, error: lastInsertedError } = await supabase
                        .from('users')
                        .select('*')
                        .order('id', { ascending: false })
                        .limit(1)
                        .single();
                    if (lastInsertedError && lastInsertedError.details !== 'Results contain 0 rows') {
                        console.error('🚀 Error retrieving last row inserted:', lastInsertedError);
                    } else {
                        console.log('🚀 Value of LAST inserted record was:', lastInsertedRecord.config);
                        if (lastInsertedRecord && !lastInsertedError) {
                            const newUserConfig = !lastInsertedRecord.config;
                            console.log('🚀 Value of NEXT inserted record was:', newUserConfig);

                            const { data: newUser, error: newUserError } = await supabase.from('users').insert([{ wallet, config: newUserConfig }]);
                            if (newUserError) {
                                console.error('🚀 ERROR adding new user:', newUserError);
                            } else {
                                console.log('🚀 New user added successfully:', newUser);
                            }
                        }
                    }
                } else if (configData && configData.length === 1) {
                    console.log('🚀 ~ getUserRole ~ configData.length:', configData.length);
                    const { data: newUser, error: newUserError } = await supabase.from('users').insert([{ wallet }]);

                    if (newUserError) {
                        console.error('🚀 ERROR adding new user:', newUserError);
                    } else {
                        console.log('🚀 New user added successfully:', newUser);
                    }
                } else {
                    console.log('🚀 No rows returned from the query');
                }
            }
        }

        return user || null;
    } catch (error) {
        console.error('nextAuth - getUserRole() - Error fetching user role:', error);
        return null;
    }
}
