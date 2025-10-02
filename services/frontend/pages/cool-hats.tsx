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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our awesome hat collection! You clicked on the Cool Hats ad and landed here. 
            Discover headwear that's both stylish and functional.
          </p>
        </div>



        {/* Hat Products Section */}
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hat Products Found</h2>
          <p className="text-gray-600">
            We're still building our hat collection! Check back soon for awesome headwear.
          </p>
        </div>

                       {/* Call to Action */}
               <div className="mt-16 text-center">
                 <div className="bg-purple-900 rounded-lg p-8">
                   <h2 className="text-3xl font-bold mb-4 text-white">Love Fashion? We've Got You Covered!</h2>
                   <p className="text-xl mb-6 text-white opacity-90">
                     Join our hat enthusiasts community and be the first to know about new arrivals.
                   </p>
                   <a href="/" className="inline-block bg-white text-purple-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                     Explore All Products
                   </a>
                 </div>
               </div>
      </Container>
    </>
  )
}

CoolHatsPage.Layout = Layout 