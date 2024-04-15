import type { GetServerSidePropsContext } from 'next'
import { Layout } from '@components/common'
import { Page } from '@customTypes/page'
import { Taxon } from '@customTypes/taxons'
import Link from 'next/link'

export const getServerSideProps = async ({ params, query }) => {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api'

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )
  const taxon: Taxon = await fetch(
    `${baseUrl}/taxonomies/${params.taxonomy}`
  ).then((res) => res.json())

  return {
    props: {
      params,
      query,
      pages,
      taxon,
    },
  }
}

export default function TopLevelTaxonomyPage({ taxon }: { taxon: Taxon }) {
  console.log(taxon)
  return (
    <div className="w-full flex py-12">
      {/* 3 columns with nothing in the first and last */}
      <div className="w-1/4"></div>
      <div className="w-1/2">
        <h1 className="text-4xl font-bold mb-4">{taxon.attributes.name}</h1>
        <div className="grid grid-cols-1 gap-4">
          {taxon?.children ? (
            taxon.children.map((child) => (
              <Link
                href={`/taxonomies/${child.permalink}`}
                key={child.id}
                className="bg-black text-white p-4"
              >
                <div className="bg-black text-white p-4">
                  <h2 className="text-2xl font-bold">{child.name}</h2>
                  <p>{child.pretty_name}</p>
                </div>
              </Link>
            ))
          ) : (
            <div>
              <p>No children found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

TopLevelTaxonomyPage.Layout = Layout
