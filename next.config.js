/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: "",
  eslint: {
    dirs: ['utils'],
  },
  webpack: (config, { isServer }) => {
    // Resolve 'request' module issue
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      request: false,
      fs: false,
      path: false,
      os: false,
      crypto: false
    };
    return config;
  }
};

module.exports = nextConfig;
