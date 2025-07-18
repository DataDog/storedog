import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'
import { SEO } from '@components/common'
import { GetServerSidePropsContext } from 'next'
import { Product } from '@customTypes/product'
import { ProductCard } from '@components/product'

interface CoolHatsPageProps {
  hatProducts: Product[]
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost:3000/api'

  try {
    // Fetch all products and filter for hat-related items
    const allProducts: Product[] = await fetch(`${baseUrl}/products`)
      .then((res) => res.json())
      .catch(() => [])

    // Filter for hat-related products (you can adjust this logic)
    const hatProducts = allProducts.filter(product => 
      product.name?.toLowerCase().includes('hat') ||
      product.name?.toLowerCase().includes('cap') ||
      product.name?.toLowerCase().includes('beanie') ||
      product.description?.toLowerCase().includes('hat') ||
      product.description?.toLowerCase().includes('headwear')
    )

    return {
      props: {
        hatProducts: hatProducts.slice(0, 12) // Limit to 12 products
      }
    }
  } catch (error) {
    console.error('Error fetching hat products:', error)
    return {
      props: {
        hatProducts: []
      }
    }
  }
}

export default function CoolHatsPage({ hatProducts }: CoolHatsPageProps) {
  return (
    <>
      <SEO
        title="Cool Hats - Storedog"
        description="Discover our amazing collection of cool hats, caps, and headwear. Style meets comfort in our curated selection."
      />
      
      <Container className="pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            🧢 Cool Hats Collection
          </h1>
          <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our awesome hat collection! You clicked on the Cool Hats ad and landed here. 
            Discover headwear that's both stylish and functional.
          </Text>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                🎉 Ad Click Success!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Great news! The ad click functionality is working perfectly. 
                  You successfully clicked on the "Cool Hats" advertisement and were redirected here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hat Products Section */}
        {hatProducts.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Hat Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hatProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                  imgProps={{
                    width: 300,
                    height: 300,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎩</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hat Products Found</h2>
            <Text className="text-gray-600">
              We're still building our hat collection! Check back soon for awesome headwear.
            </Text>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Love Hats? We've Got You Covered!</h2>
            <Text className="text-xl mb-6 opacity-90">
              Join our hat enthusiasts community and be the first to know about new arrivals.
            </Text>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Explore All Products
            </button>
          </div>
        </div>
      </Container>
    </>
  )
}

CoolHatsPage.Layout = Layout 