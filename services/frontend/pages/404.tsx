import { Layout } from '@components/common'
import { Text } from '@components/ui'

import { Page } from '@customTypes/page'

export async function getServerSideProps() {
  // get pages for the footer
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api'

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )

  return {
    props: {
      pages,
    },
  }
}

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-8 sm:mx-auto py-20 flex flex-col items-center justify-center fit">
      <Text variant="heading">Not Found</Text>
      <Text className="">
        The requested page doesn't exist or you don't have access to it.
      </Text>
    </div>
  )
}

NotFound.Layout = Layout
