module.exports = {
  productionBrowserSourceMaps: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [process.env.NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN],
  },
  // Rewrites to support dynamic routes without special characters in filenames.
  // The [...] spread pattern is not allowed by push protection rules, so we use
  // rewrites to map the original URL patterns to renamed files.
  // See: dynamic-page.tsx (was [...pages].tsx) and taxonomies/child-taxon.tsx (was [...slug].tsx)
  async rewrites() {
    return [
      // Catch-all for nested taxonomy paths like /taxonomies/categories/clothing/shirts
      {
        source: '/taxonomies/:taxonomy/:slug+',
        destination: '/taxonomies/child-taxon?taxonomy=:taxonomy&slug=:slug*',
      },
      // Catch-all for dynamic pages like /about, /contact, etc.
      {
        source: '/:pages+',
        destination: '/dynamic-page?pages=:pages*',
      },
    ]
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    const externals = [
      // required if you use native metrics
      '@datadog/native-metrics',

      // required if you use profiling
      '@datadog/pprof',

      // required if you use Datadog security features
      '@datadog/native-appsec',
      '@datadog/native-iast-taint-tracking',
      '@datadog/native-iast-rewriter',

      // required if you encounter graphql errors during the build step
      'graphql/language/visitor',
      'graphql/language/printer',
      'graphql/utilities',
    ]
    config.externals.push(...externals)
    return config
  },
}
