/**
 * Dynamic handler for nested taxonomy paths.
 *
 * This file was renamed from [...slug].tsx because the [...] spread pattern
 * is not allowed by push protection rules. The original URL routing is preserved
 * via a rewrite rule in next.config.js:
 *   source: '/taxonomies/:taxonomy/:slug+' -> destination: '/taxonomies/child-taxon?taxonomy=:taxonomy&slug=:slug*'
 *
 * The 'taxonomy' and 'slug' query parameters contain the dynamic path segments.
 */
import { Page } from '@customTypes/page'
import { Taxon } from '@customTypes/taxons'
import { ProductList } from '@components/product'
import { Layout } from '@components/common'

export const getServerSideProps = async ({ query }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost:3000/api'

  const { taxonomy, slug } = query

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  const taxonRes = await fetch(`${baseUrl}/taxonomies/${taxonomy}/${slug}`)
  if (!taxonRes.ok) {
    return { notFound: true }
  }
  const taxon: Taxon = await taxonRes.json()

  if (!taxon?.id) {
    return { notFound: true }
  }

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
