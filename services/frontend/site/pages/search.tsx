import type { GetStaticPropsContext } from 'next'
import Search from '@components/search'
import { getProducts, getPages } from '@lib/api/spree'

export async function getStaticProps(context: GetStaticPropsContext) {
  const products = await getProducts({
    include: 'default_variant,images,primary_variant',
    page: 1,
  })

  const pages = await getPages()

  return {
    props: {
      products,
      pages,
    },
    revalidate: 60,
  }
}

export default Search
