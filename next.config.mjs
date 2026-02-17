/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true, // Uses Rust compiler for faster builds & minification
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.google.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // Google User Avatars
            },
        ],
        minimumCacheTTL: 60,
    },
    // Production optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === "production" ? {
            exclude: ['error'],
        } : false,
    },
    experimental: {
        optimizeCss: true, // Enable critical CSS optimization
    },
};

export default nextConfig;
