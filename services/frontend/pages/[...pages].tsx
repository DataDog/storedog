import type { GetServerSidePropsContext } from 'next'
import { Text } from '@components/ui'
import { Layout } from '@components/common'
import { useRouter } from 'next/router'
import { Page } from '@customTypes/page'

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext<{ pages: string }>) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api'
  const slug = params?.pages as string

  const page = await fetch(`${baseUrl}/pages/${slug}`).then((res) => res.json())

  // get all pages for menu
  const pages = await fetch(`${baseUrl}/pages`).then((res) => res.json())

  if (!page) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      page,
      pages,
    },
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
