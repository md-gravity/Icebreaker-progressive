/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  webpack: (config) => {
    /**
     * Fix surrealdb.js ws import for webpack frontend bundle
     */
    config.externals.push({'utf-8-validate': 'utf-8-validate'})
    config.externals.push({bufferutil: 'bufferutil'})

    return config
  },
}

// eslint-disable-next-line import/no-commonjs
module.exports = nextConfig
