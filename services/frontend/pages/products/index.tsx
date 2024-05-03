import type { GetServerSidePropsContext } from 'next'
import { ProductList } from '@components/product'
import { Page } from '@customTypes/page'
import { Product } from '@customTypes/product'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api'

  const products: Product[] = await fetch(`${baseUrl}/products`).then((res) =>
    res.json()
  )
  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  const taxons = await fetch(`${baseUrl}/taxonomies`).then((res) => res.json())

  return {
    props: {
      products,
      pages,
      taxons,
      cardVersion: 'v2',
    },
  }
}

export default ProductList
