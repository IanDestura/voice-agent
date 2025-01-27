/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    disableStaticImages: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
