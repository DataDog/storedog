import type { GetServerSidePropsContext } from 'next'
import { Layout } from '@components/common'
import { Page } from '@customTypes/page'
import { Taxon } from '@customTypes/taxons'
import { Container } from '@components/ui'
import Link from 'next/link'

export const getServerSideProps = async ({ params }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`
    : 'http://localhost/api'

  const pages: Page[] = await fetch(`${baseUrl}/pages`).then((res) =>
    res.json()
  )
  const taxon: Taxon = await fetch(
    `${baseUrl}/taxonomies/${params.taxonomy}`
  ).then((res) => res.json())

  const taxons: any = await fetch(`${baseUrl}/taxonomies`).then((res) =>
    res.json()
  )

  return {
    props: {
      pages,
      taxon,
      taxons,
    },
  }
}

export default function TopLevelTaxonomyPage({
  taxon,
  taxons,
}: {
  taxon: Taxon
  taxons: any
}) {
  function renderTaxonsList(taxons: any) {
    return Object.keys(taxons).map((taxon) => {
      return (
        <li
          className={taxons[taxon].children?.length ? 'list-none' : 'list-disc'}
          key={taxons[taxon].id}
        >
          <Link href={`/taxonomies/${taxons[taxon].attributes.permalink}`}>
            {taxons[taxon].attributes.name}
          </Link>
          {taxons[taxon].children?.length > 0 && (
            <ul className="ps-5 mt-2 space-y-1 list-disc list-inside">
              {renderTaxonsList(taxons[taxon].children)}
            </ul>
          )}
        </li>
      )
    })
  }
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3 mb-20">
        <div className="col-span-8 lg:col-span-2 order-1 lg:order-none">
          <ul className="space-y-4 text-gray-500 list-disc list-inside dark:text-gray-400">
            {renderTaxonsList(taxons)}
          </ul>
        </div>
        <div className="col-span-8 order-3 lg:order-none">
          <h1 className="text-4xl font-bold mb-4">{taxon.attributes.name}</h1>
          <div className="grid grid-cols-1 gap-4">
            {taxon?.children ? (
              taxon.children.map((child) => (
                <Link href={`/taxonomies/${child.permalink}`} key={child.id}>
                  <div className="bg-black text-white p-4 cursor-pointer ">
                    <h2 className="text-2xl font-bold">{child.name}</h2>
                    <p>{child.pretty_name}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div>
                <p>No {taxon.attributes.name} found!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

TopLevelTaxonomyPage.Layout = Layout
