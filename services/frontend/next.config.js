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
  // Rewrites to support dynamic taxonomy routes without special characters in filenames
  // This maintains Windows file system compatibility
  async rewrites() {
    return [
      // API routes
      {
        source: '/api/taxonomies/:taxonomy/:slug+',
        destination: '/api/taxonomies/taxonomy-slug-api?taxonomy=:taxonomy&slug=:slug*',
      },
      {
        source: '/api/taxonomies/:taxonomy',
        destination: '/api/taxonomies/taxonomy-api?taxonomy=:taxonomy',
      },
      // Page routes
      {
        source: '/taxonomies/:taxonomy/:slug+',
        destination: '/taxonomies/taxonomy-slug-page?taxonomy=:taxonomy&slug=:slug*',
      },
      {
        source: '/taxonomies/:taxonomy',
        destination: '/taxonomies/taxonomy-page?taxonomy=:taxonomy',
      },
    ]
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    const externals = [
      // required if you encounter graphql errors during the build step
      'graphql/language/visitor',
      'graphql/language/printer',
      'graphql/utilities',
    ]
    config.externals.push(...externals)
    return config
  },
}
