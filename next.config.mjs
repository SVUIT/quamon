// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './.next',
  turbopack: {}, // Empty config to use Turbopack with default settings
  reactStrictMode: false, // Disabled to prevent double-rendering in development
  compiler: {
    reactRemoveProperties: {
      properties: ['^crxlauncher$'],
    },
  },
  experimental: {
    // Helps with some hydration issues in development
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
  },
  compress: true,
  webpack: (config, { isServer, dev }) => {
    // Optimize chunks for better code splitting in production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
