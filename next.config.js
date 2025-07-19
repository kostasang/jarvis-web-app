/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Set basePath for GitHub Pages (change 'jarvis-web-app' to your repo name)
  basePath: process.env.NODE_ENV === 'production' ? '/jarvis-web-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/jarvis-web-app' : '',
}

module.exports = nextConfig 