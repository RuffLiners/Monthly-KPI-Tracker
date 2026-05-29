/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['xlsx'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
