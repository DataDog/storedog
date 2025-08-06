import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'
import { SEO } from '@components/common'
import { GetServerSidePropsContext } from 'next'
import { Product } from '@customTypes/product'
import { ProductCard } from '@components/product'

interface DiscountClothingPageProps {
  clothingProducts: Product[]
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost:3000/api'

  try {
    // Fetch all products and filter for clothing-related items
    const allProducts: Product[] = await fetch(`${baseUrl}/products`)
      .then((res) => res.json())
      .catch(() => [])

    // Filter for clothing-related products
    const clothingProducts = allProducts.filter(product => 
      product.name?.toLowerCase().includes('shirt') ||
      product.name?.toLowerCase().includes('dress') ||
      product.name?.toLowerCase().includes('pants') ||
      product.name?.toLowerCase().includes('jeans') ||
      product.name?.toLowerCase().includes('sweater') ||
      product.name?.toLowerCase().includes('jacket') ||
      product.name?.toLowerCase().includes('coat') ||
      product.name?.toLowerCase().includes('blouse') ||
      product.name?.toLowerCase().includes('skirt') ||
      product.name?.toLowerCase().includes('t-shirt') ||
      product.name?.toLowerCase().includes('hoodie') ||
      product.description?.toLowerCase().includes('shirt') ||
      product.description?.toLowerCase().includes('dress') ||
      product.description?.toLowerCase().includes('pants') ||
      product.description?.toLowerCase().includes('jeans') ||
      product.description?.toLowerCase().includes('sweater') ||
      product.description?.toLowerCase().includes('jacket') ||
      product.description?.toLowerCase().includes('coat') ||
      product.description?.toLowerCase().includes('blouse') ||
      product.description?.toLowerCase().includes('skirt') ||
      product.description?.toLowerCase().includes('t-shirt') ||
      product.description?.toLowerCase().includes('hoodie')
    )

    return {
      props: {
        clothingProducts: clothingProducts.slice(0, 12) // Limit to 12 products
      }
    }
  } catch (error) {
    console.error('Error fetching clothing products:', error)
    return {
      props: {
        clothingProducts: []
      }
    }
  }
}

export default function DiscountClothingPage({ clothingProducts }: DiscountClothingPageProps) {
  return (
    <>
      <SEO
        title="Discount Clothing - Storedog"
        description="Discover our amazing collection of discount clothing and fashion items. Style meets affordability in our curated selection."
      />
      
      <Container className="pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            👕 Discount Clothing Collection
          </h1>
          <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our fabulous discount clothing collection! You clicked on the Discount Clothing ad and landed here. 
            Discover stylish fashion at unbeatable prices.
          </Text>
        </div>



        {/* Clothing Products Section */}
        {clothingProducts.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Clothing Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clothingProducts.map((product) => (
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
            <div className="text-6xl mb-4">👕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Clothing Products Found</h2>
            <Text className="text-gray-600">
              We're still building our clothing collection! Check back soon for fabulous fashion items.
            </Text>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-purple-900 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4 text-white">Love Fashion? We've Got You Covered!</h2>
            <Text className="text-xl mb-6 text-white opacity-90">
              Join our fashion-forward community and be the first to know about new arrivals and exclusive discounts.
            </Text>
            <a href="/" className="inline-block bg-white text-purple-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Explore All Products
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}

DiscountClothingPage.Layout = Layout 