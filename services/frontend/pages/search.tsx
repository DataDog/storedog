import type { GetServerSidePropsContext } from 'next'
import Search from '@components/search'
import { getProducts } from '@lib/api/products'
import { getPages } from '@lib/api/pages'

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
  }
}

export default Search
