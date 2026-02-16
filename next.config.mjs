/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Disable type checking and linting during build to save memory (512MB limit on Render free tier)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use SWC minifier (faster and less memory than Terser)
  swcMinify: true,
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    instrumentationHook: true,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
