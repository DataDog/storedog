import type { GetServerSidePropsContext } from 'next'
import { ProductList } from '@components/product'
import { Page } from '@customTypes/page'
import { Product } from '@customTypes/product'
import { codeStash } from 'code-stash'
import config from '../../featureFlags.config.json'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost:3000/api'

  const products: Product[] = await fetch(`${baseUrl}/products`).then((res) =>
    res.json()
  )
  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  const taxons = await fetch(`${baseUrl}/taxonomies`).then((res) => res.json())

  const flag =
    (await codeStash('product-card-frustration', { file: config })) || false

  return {
    props: {
      products,
      pages,
      taxons,
      cardVersion: flag ? 'v2' : 'v1',
    },
  }
}

export default ProductList
