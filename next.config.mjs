/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['xlsx'],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default nextConfig
