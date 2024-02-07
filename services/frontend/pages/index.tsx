import { Layout } from '@components/common'
import Ad from '@components/common/Ad'
import { ProductCard } from '@components/product'
import { Grid, Marquee, Hero } from '@components/ui'
import { getProducts } from '@lib/api/products'
import type { InferGetServerSidePropsType } from 'next'
import { Product } from '@customTypes/product'
import { Page } from '@customTypes/page'

export async function getServerSideProps() {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api'

  const products: Product[] = await getProducts({
    include: 'default_variant,images,primary_variant',
    page: 1,
  })

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  return {
    props: {
      products,
      pages,
    },
  }
}

export default function Home({
  products,
  pages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Grid variant="filled">
        {products.slice(0, 3).map((product: any, i: number) => (
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
