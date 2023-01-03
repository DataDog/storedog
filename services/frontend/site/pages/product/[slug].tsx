import type { GetServerSidePropsContext, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import commerce from '@lib/api/commerce';
import { Layout } from '@components/common';
import { ProductView } from '@components/product';

function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export async function getServerSideProps({
  req,
  params,
  locale,
  locales,
  preview,
}: GetServerSidePropsContext<{ slug: string }>) {
  const config = { locale, locales };
  const pagesPromise = commerce.getAllPages({ config, preview });
  const siteInfoPromise = commerce.getSiteInfo({ config, preview });
  const productPromise = commerce.getProduct({
    variables: { slug: params!.slug },
    config,
    preview,
  });

  const allProductsPromise = commerce.getAllProducts({
    variables: { first: 4 },
    config,
    preview,
  });
  const { pages } = await pagesPromise;
  const { categories } = await siteInfoPromise;
  const { product } = await productPromise;
  const { products: relatedProducts } = await allProductsPromise;

  if (!product) {
    throw new Error(`Product with slug '${params!.slug}' not found`);
  }

  return {
    props: {
      pages,
      product,
      relatedProducts,
      categories,
      headers: req.headers,
    },
  };
}

export default function Slug({
  product,
  relatedProducts,
  headers,
  categories,
  pages,
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      loadData();
    }
  }, [loading]);

  async function loadData() {
    if (headers.referer.includes('/search')) {
      await later(Math.round(Math.random() * 7000) + 500);
    }
    setLoading(false);
  }

  return router.isFallback || loading ? (
    <h1>Loading...</h1>
  ) : (
    <ProductView
      product={product}
      relatedProducts={relatedProducts}
      referer={headers.referer}
    />
  );
}

Slug.Layout = Layout;
