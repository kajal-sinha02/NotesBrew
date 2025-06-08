import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // increase limit to 10mb (or whatever you want)
      // allowedOrigins: [], // optional
    },
  },
   api: {
    bodyParser: false,  // disable Next.js default parser
  },
  images: {
    domains: ['res.cloudinary.com'], // allow Cloudinary-hosted assets
    formats: ['image/avif', 'image/webp'], // optional image formats
  },
  //  eslint: {
  //   ignoreDuringBuilds: true,
  // },

};

export default nextConfig;
