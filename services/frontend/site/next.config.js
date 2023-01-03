const commerce = require('./commerce.config.json')
const { withCommerceConfig, getProviderName } = require('./commerce-config')

const provider = commerce.provider || getProviderName()
const isBC = false
const isShopify = false
const isSaleor = false
const isSwell = false
const isVendure = false

module.exports = withCommerceConfig({
  commerce,
  images: {
    domains: [process.env.NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN],
  },
  i18n: {
    locales: ['en-US', 'es'],
    defaultLocale: 'en-US',
  },
  rewrites() {
    return [
      (isBC || isShopify || isSwell || isVendure || isSaleor) && {
        source: '/checkout',
        destination: '/api/checkout',
      },
      // The logout is also an action so this route is not required, but it's also another way
      // you can allow a logout!
      isBC && {
        source: '/logout',
        destination: '/api/logout?redirect_to=/',
      },
      // For Vendure, rewrite the local api url to the remote (external) api url. This is required
      // to make the session cookies work.
      isVendure &&
        process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL && {
          source: `${process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL}/:path*`,
          destination: `${process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL}/:path*`,
        },
    ].filter(Boolean)
  },
})

// Don't delete this console log, useful to see the commerce config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
