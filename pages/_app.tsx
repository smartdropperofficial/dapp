import type { AppProps } from 'next/app';
import { configureChains, createClient, useAccount, WagmiConfig } from 'wagmi';
import { hardhat, PolygonFork, polygonAmoy } from '../lib/hardhatLocal';
import { polygon } from '@wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import Layout from '../components/UI/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.scss';
import OrderContextProvider from '../store/order-context';
import SubscriptionContextProvider from '../store/subscription-context';
import ConfigContextProvider from '../store/config-context';

import { getDefaultWallets, RainbowKitProvider, lightTheme, Theme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import { publicProvider } from 'wagmi/providers/public';
import merge from 'lodash.merge';
import Head from 'next/head';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

const isDev = process.env.NODE_ENV === 'development';

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const CHAINS = isDev ? [hardhat, polygon] : [polygon, hardhat];
// const CHAINS = [hardhat];

const { provider, chains } = configureChains(CHAINS, [alchemyProvider({ apiKey: alchemyId! }), publicProvider()]);

const { connectors } = getDefaultWallets({
    appName: 'SmartShopper',
    projectId: 'fb7a4c04880c1d40d8123fa117491552',
    chains,
});

const client = createClient({
    autoConnect: true,
    provider,
    connectors,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
    domain: window.location.host,
    statement: 'Sign in with your Wallet.',
    uri: window.location.origin,
    version: '1',
});

const myTheme = merge(lightTheme(), {
    colors: {
        accentColor: '#ff9900',
    },
} as Theme);
const authRequiredRoutes = ['/dashboard', '/profile', '/protected-page'];
export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isAuthRequired = authRequiredRoutes.includes(router.pathname);
    const metadata = {
        title: 'Smart Dropper | Shop on Amazon using Crypto  ',
        description:
            'Smart Dropper is the first decentralized platform that allows users to buy on Amazon by just using their DeFi Wallet, like Metamask or TrustWallet.',
        generator: 'Next.js',
        manifest: '/manifest.json',
        keywords: ['nextjs', 'nextjs13', 'next13', 'pwa', 'next-pwa'],
        themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],

        viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
    };

    return (
        <>
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="generator" content={metadata.generator} />
                <link rel="manifest" href={metadata.manifest} />
                {metadata.keywords && <meta name="keywords" content={metadata.keywords.join(',')} />}
                {metadata.themeColor && <meta name="theme-color" content={metadata.themeColor[0].color} media={metadata.themeColor[0].media} />}
                <meta name="viewport" content={metadata.viewport} />
            </Head>
            <WagmiConfig client={client}>
                <SessionProvider refetchInterval={0} session={pageProps.session}>
                    <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
                        <RainbowKitProvider chains={chains} theme={myTheme}>
                            <ConfigContextProvider>
                                <SubscriptionContextProvider>
                                    <OrderContextProvider>
                                        <Layout>
                                            {isAuthRequired ? (
                                                <ProtectedRoute>
                                                    <Component {...pageProps} />
                                                </ProtectedRoute>
                                            ) : (
                                                <Component {...pageProps} />
                                            )}
                                        </Layout>
                                    </OrderContextProvider>
                                </SubscriptionContextProvider>
                            </ConfigContextProvider>
                        </RainbowKitProvider>
                    </RainbowKitSiweNextAuthProvider>
                </SessionProvider>
            </WagmiConfig>
        </>
    );
}
interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
        }
    }, [session, status, router]);

    if (!session) {
        return null;
    }

    return <>{children}</>;
}
