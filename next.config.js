// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Or your preferred setting
  images: {
    domains: [
      'arweave.net',
      'www.arweave.net',
      'gateway.irys.xyz', 
    ],
  },
  // any other configurations you have...
};

module.exports = nextConfig;