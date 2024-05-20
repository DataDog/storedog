import type { InferGetServerSidePropsType } from 'next'
import { Layout } from '@components/common'
import Ad from '@components/common/Ad'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero } from '@components/ui'
import { Product } from '@customTypes/product'
import { Page } from '@customTypes/page'

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`
    : 'http://localhost/api'

  const products: Product[] = await fetch(`${baseUrl}/products`).then((res) =>
    res.json()
  )

  // if products exists and is an array, reverse it
  if (products && Array.isArray(products)) {
    products.reverse()
  }

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  const taxons = await fetch(`${baseUrl}/taxonomies`).then((res) => res.json())

  return {
    props: {
      products,
      pages,
      taxons,
    },
  }
}

export default function Home({
  products,
  pages,
  taxons,
}: // taxons,
InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(taxons)
  return (
    <>
      <Grid variant="filled">
        {products.slice(0, 6).map((product: any, i: number) => (
          <ProductCard
            key={product.id}
            product={product}
            imgProps={{
              width: i === 0 ? 1080 : 540,
              height: i === 0 ? 1080 : 540,
              priority: true,
            }}
          />
        ))}
      </Grid>
      <Ad />
      <Hero
        headline="The best gear, at the best prices."
        description="Cupcake ipsum dolor sit amet lemon drops pastry cotton candy. Sweet carrot cake macaroon bonbon croissant fruitcake jujubes macaroon oat cake. Soufflé bonbon caramels jelly beans. Tiramisu sweet roll cheesecake pie carrot cake. "
        className="bg-primary-2"
      />

      <Marquee>
        {products.map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} variant="slim" />
        ))}
      </Marquee>
    </>
  )
}

Home.Layout = Layout
