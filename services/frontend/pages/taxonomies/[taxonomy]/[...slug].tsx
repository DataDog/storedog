import { Page } from '@customTypes/page'
import { Taxon } from '@customTypes/taxons'
import { ProductList } from '@components/product'
import { Layout } from '@components/common'

export const getServerSideProps = async ({ params }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`
    : 'http://localhost/api'

  const { taxonomy, slug } = params

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )
  const taxon: Taxon = await fetch(
    `${baseUrl}/taxonomies/${taxonomy}/${slug}`
  ).then((res) => res.json())

  const taxons: any = await fetch(`${baseUrl}/taxonomies`).then((res) =>
    res.json()
  )

  const products: any = await fetch(
    `${baseUrl}/products?taxons=${taxon.id}`
  ).then((res) => res.json())

  return {
    props: {
      pages,
      taxon,
      taxons,
      products,
    },
  }
}

const TaxonomyPage = ({ pages, taxon, taxons, products }) => {
  return (
    <ProductList
      products={products}
      pages={pages}
      taxons={taxons}
      taxon={taxon}
    />
  )
}

export default TaxonomyPage

TaxonomyPage.Layout = Layout
