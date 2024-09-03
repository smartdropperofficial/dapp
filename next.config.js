/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compress: true,
    swcMinify: true,
    webpack(config, { dev }) {
        if (!dev) {
            // Disabilita i source maps in produzione
            config.devtool = 'hidden-source-map';
        }

        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },
    images: {
        domains: ['m.media-amazon.com', 'images-na.ssl-images-amazon.com'],
    },
    sassOptions: {
        includePaths: ['styles'],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV !== 'development', // Remove console.log in production
    },
};

const prod = process.env.NODE_ENV === 'production';
const withPWA = require('next-pwa')({
    dest: 'public', // Destination directory for the PWA files
    disable: !prod, // Disable PWA in development mode
    register: true, // Register the PWA service worker
    skipWaiting: true, // Skip waiting for service worker activation
});

module.exports = withPWA(nextConfig);
