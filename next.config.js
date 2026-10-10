/** @type {import('next').NextConfig} */
const partnerHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://dzlmtvodpyhetvektfuo.supabase.co; img-src 'self' https: data: blob:" },
];
const nextConfig = {
  async headers() {
    return [{ source: '/venues', headers: partnerHeaders }, { source: '/venue-portal/:path*', headers: partnerHeaders }];
  },
  async rewrites() {
    return [{ source: '/venues', destination: '/venue-portal/index.html' }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dzlmtvodpyhetvektfuo.supabase.co' },
    ],
  },
};
module.exports = nextConfig;
