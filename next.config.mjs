const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }] },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
