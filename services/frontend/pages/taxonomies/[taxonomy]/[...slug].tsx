import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { ProductList } from '@components/product'
import { Layout } from '@components/common'

const TaxonomyPage = () => {
  const router = useRouter()
  const { taxonomy, slug } = router.query

  const [products, setProducts] = useState([])
  const [pages, setPages] = useState([])
  const [taxons, setTaxons] = useState([])
  const [taxon, setTaxon] = useState<{ id?: string }>({})

  const fetchPages = useCallback(async () => {
    const pages = await fetch(`/api/pages`).then((res) => res.json())
    setPages(pages)
  }, [])

  const fetchTaxons = useCallback(async () => {
    const taxons = await fetch(`/api/taxonomies`).then((res) => res.json())
    setTaxons(taxons)
  }, [])

  const fetchTaxon = useCallback(async () => {
    if (!slug) return

    const taxon = await fetch(`/api/taxonomies/${taxonomy}/${slug}`).then(
      (res) => res.json()
    )
    setTaxon(taxon)
  }, [slug, taxonomy])

  const fetchProducts = useCallback(async (taxonId) => {
    if (!taxonId) return
    const products = await fetch(`/api/products?taxons=${taxonId}`).then(
      (res) => res.json()
    )

    if (products?.length === 0 || products?.error) {
      console.log('No products found')
      return
    }

    setProducts(products)
  }, [])

  useEffect(() => {
    fetchPages()
    fetchTaxons()
    fetchTaxon()
  }, [fetchPages, fetchTaxons, fetchTaxon])

  useEffect(() => {
    if (taxon.id) {
      fetchProducts(taxon.id)
    }
  }, [taxon, fetchProducts])

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
