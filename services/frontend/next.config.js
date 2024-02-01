module.exports = {
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
  i18n: {
    locales: ['en-US', 'es'],
    defaultLocale: 'en-US',
  },
  exportPathMap: function () {
    return {
      '/': { page: '/' },
      // '/blog/nextjs': { page: '/blog/[post]/comment/[id]' },        // wrong
      // '/blog/nextjs/comment/1': { page: '/blog/[post]/comment/[id]' }, // correct
    }
  },
}

// Don't delete this console log, useful to see the commerce config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
