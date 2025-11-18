/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@neurastate/shared'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
