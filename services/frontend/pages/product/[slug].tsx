import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '@components/common'
import { ProductView } from '@components/product'
import { getProducts, getProduct } from '@lib/api/products'
import { getPages } from '@lib/api/pages'

function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay)
  })
}

export async function getServerSideProps({
  req,
  params,
  locale,
  locales,
  preview,
}: GetServerSidePropsContext<{ slug: string }>) {
  const product = await getProduct({
    id: params!.slug,
    include:
      'default_variant,variants,option_types,product_properties,taxons,images,primary_variant',
  })

  const relatedProducts = await getProducts({
    include: 'images',
    per_page: 4,
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

  useEffect(() => {
    if (loading) {
      loadData()
    }
  }, [loading])

  async function loadData() {
    if (headers?.referer?.includes('/search')) {
      await later(Math.round(Math.random() * 7000) + 500)
    }
    setLoading(false)
  }

  return router.isFallback || loading ? (
    <h1>Loading...</h1>
  ) : (
    <ProductView
      product={product}
      relatedProducts={relatedProducts}
      referer={headers.referer}
    />
  )
}

ProductPage.Layout = Layout
