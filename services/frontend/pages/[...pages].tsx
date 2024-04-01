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

  const pageRes = await fetch(`${baseUrl}/pages/${slug}`)

  if (!pageRes.ok) {
    return {
      notFound: true,
    }
  }
  const page = await pageRes.json()

  // get all pages for menu
  const pages = await fetch(`${baseUrl}/pages`).then((res) => res.json())

  return {
    props: {
      page,
      pages,
    },
  }
}

export default function Pages({ page }: { page: Page }) {
  const router = useRouter()
  console.log(page)

  return router.isFallback ? (
    <h1>Loading...</h1>
  ) : (
    <div className="max-w-2xl mx-8 sm:mx-auto py-20">
      {page?.content && <Text html={page.content} />}
    </div>
  )
}

Pages.Layout = Layout
