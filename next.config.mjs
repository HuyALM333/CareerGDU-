/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'http',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'http',
        hostname: '**.youtube.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard/manage-applications',
        destination: '/dashboard/applicants-manager',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
