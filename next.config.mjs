/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'
    const commonHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
    ]

    const productionOnlyHeaders = isProduction
      ? [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; script-src 'self' 'unsafe-inline' https://accounts.google.com https://*.gstatic.com; frame-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.myshopify.com https://cdn.shopify.com https://api.judge.me https://accounts.google.com https://*.gstatic.com; font-src 'self' data: https://*.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ]
      : []

    return [
      {
        source: '/(.*)',
        headers: [...commonHeaders, ...productionOnlyHeaders],
      },
    ]
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
    ],
  },
}

export default nextConfig
