import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'
import { SEO } from '@components/common'
import { GetServerSidePropsContext } from 'next'
import { Product } from '@customTypes/product'
import { ProductCard } from '@components/product'

interface NiceBagsPageProps {
  bagProducts: Product[]
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost:3000/api'

  try {
    // Fetch all products and filter for bag-related items
    const allProducts: Product[] = await fetch(`${baseUrl}/products`)
      .then((res) => res.json())
      .catch(() => [])

    // Filter for bag-related products
    const bagProducts = allProducts.filter(product => 
      product.name?.toLowerCase().includes('bag') ||
      product.name?.toLowerCase().includes('purse') ||
      product.name?.toLowerCase().includes('handbag') ||
      product.name?.toLowerCase().includes('backpack') ||
      product.name?.toLowerCase().includes('tote') ||
      product.name?.toLowerCase().includes('clutch') ||
      product.description?.toLowerCase().includes('bag') ||
      product.description?.toLowerCase().includes('purse') ||
      product.description?.toLowerCase().includes('handbag') ||
      product.description?.toLowerCase().includes('backpack')
    )

    return {
      props: {
        bagProducts: bagProducts.slice(0, 12) // Limit to 12 products
      }
    }
  } catch (error) {
    console.error('Error fetching bag products:', error)
    return {
      props: {
        bagProducts: []
      }
    }
  }
}

export default function NiceBagsPage({ bagProducts }: NiceBagsPageProps) {
  return (
    <>
      <SEO
        title="Nice Bags - Storedog"
        description="Discover our amazing collection of nice bags, purses, and accessories. Style meets functionality in our curated selection."
      />
      
      <Container className="pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            👜 Nice Bags Collection
          </h1>
          <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our fabulous bag collection! You clicked on the Nice Bags ad and landed here. 
            Discover bags that are both stylish and practical for every occasion.
          </Text>
        </div>



        {/* Bag Products Section */}
        {bagProducts.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Bag Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {bagProducts.map((product) => (
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
            <div className="text-6xl mb-4">👜</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bag Products Found</h2>
            <Text className="text-gray-600">
              We're still building our bag collection! Check back soon for fabulous accessories.
            </Text>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-purple-900 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4 text-white">Love Fashion? We've Got You Covered!</h2>
            <Text className="text-xl mb-6 text-white opacity-90">
              Join our fashion-forward community and be the first to know about new arrivals.
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

NiceBagsPage.Layout = Layout 