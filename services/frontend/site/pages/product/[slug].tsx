import type { GetServerSidePropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Layout } from '@components/common'
import { ProductView } from '@components/product'
import { getProduct, getProducts, getPages } from '@lib/api/spree'

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
    per_page: 5,
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

export default function Slug({
  product,
  relatedProducts,
  headers,
  pages,
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  console.log(product)
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

Slug.Layout = Layout
