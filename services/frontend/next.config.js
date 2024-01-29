module.exports = {  
  images: {
    domains: [process.env.NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN],
  },
  i18n: {
    locales: ['en-US', 'es'],
    defaultLocale: 'en-US',
  },
}

// Don't delete this console log, useful to see the commerce config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
