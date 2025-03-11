import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import { Layout } from '@components/common'
import { ProductView } from '@components/product'
import { getPages } from '@lib/api/pages'
import { Product } from '@customTypes/product'

function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay)
  })
}

export async function getServerSideProps({
  req,
  params,
}: GetServerSidePropsContext<{ slug: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE
    ? `${process.env.NEXT_PUBLIC_FRONTEND_API_ROUTE}/api`
    : 'http://localhost/api'

  const product: Product = await fetch(
    `${baseUrl}/products/${params?.slug}?include=default_variant,variants,option_types,product_properties,taxons,images,primary_variant`
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      return {}
    })

  const relatedProducts: Product[] = await fetch(
    `${baseUrl}/products?per_page=4&include=images`
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      return []
    })

  const pages = await getPages()

  return {
    props: {
      pages,
      product,
      relatedProducts,
      headers: req.headers,
    },
  }
}

export default function ProductPage({
  product,
  relatedProducts,
  headers,
  pages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (headers?.referer?.includes('/search')) {
      await later(Math.round(Math.random() * 7000) + 500)
    }
    setLoading(false)
  }, [headers?.referer])

  useEffect(() => {
    if (loading) {
      loadData()
    }
  }, [loading, loadData])

  return router.isFallback || loading ? (
    <h1>Loading...</h1>
  ) : (
    <ProductView product={product} relatedProducts={relatedProducts} />
  )
}

ProductPage.Layout = Layout
