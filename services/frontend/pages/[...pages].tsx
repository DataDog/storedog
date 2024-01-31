import type { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import { Text } from '@components/ui'
import { Layout } from '@components/common'
import getSlug from '@lib/get-slug'
import { useRouter } from 'next/router'
import { getPages, getPage } from '@lib/api/pages'
import { Page } from '@customTypes/page'

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ pages: string[] }>) {
  if (!params) {
    throw new Error(`Missing params`)
  }

  const slug = params.pages.join('/')
  const page = await getPage(slug)
  const pages = await getPages()

  if (!page) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      pages,
      page,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths({}: GetStaticPathsContext) {
  const pages = await getPages()
  const paths = pages.map((page: Page) => ({
    params: { pages: [getSlug(page.url)] },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export default function Pages({ page }: { page: Page }) {
  const router = useRouter()

  return router.isFallback ? (
    <h1>Loading...</h1>
  ) : (
    <div className="max-w-2xl mx-8 sm:mx-auto py-20">
      {page?.content && <Text html={page.content} />}
    </div>
  )
}

Pages.Layout = Layout
