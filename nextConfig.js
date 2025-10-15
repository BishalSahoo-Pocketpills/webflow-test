import { withSentryConfig } from '@sentry/nextjs';
import CSP_HEADERS from './cspHeaders.js';

// Required nextConfig to handle the project requirements.
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pocketpills.com',
      },
    ],
  },
  staticPageGenerationTimeout: 180,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CSP_HEADERS,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://*.pocketpills.com;',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS, POST',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Expect-CT',
            value: 'max-age=63072000;',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          { key: 'Origin-Agent-Cluster', value: '?1' },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'max-age=63072000;',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'acq-web-pocketpills.vercel.app',
        '*.pocketpills.vercel.app',
        '*.pocketpills.com',
      ],
    },
    optimizePackageImports: ['my-lib'],
  },
};

function createNextConfig(newNextConfig, enabledSentry = true) {
  if (enabledSentry === false || process.env.VERCEL_ENV !== 'production') {
    return { ...newNextConfig, ...nextConfig };
  }

  // Overriding the nextConfig to work with Sentry
  const nextConfigWithSentry = withSentryConfig(
    { ...nextConfig, ...newNextConfig },
    {
      org: 'pocketpills-mp',
      project: 'acq-web',

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Automatically annotate React components to show their full name in breadcrumbs and session replay
      reactComponentAnnotation: {
        enabled: true,
      },

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      // tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
    }
  );
  return nextConfigWithSentry;
}

export default createNextConfig;
