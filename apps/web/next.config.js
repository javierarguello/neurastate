/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }

    // Ignore pg-native optional dependency warning
    config.externals = config.externals || [];
    config.externals.push('pg-native');

    // Suppress specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pg\/lib\/native/ },
    ];

    return config;
  },
  // Transpile shared package
  transpilePackages: ['@neurastate/shared'],
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
