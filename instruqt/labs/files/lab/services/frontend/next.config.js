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
    domains: [
      process.env.NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN || 'localhost',
    ].filter(Boolean),
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
