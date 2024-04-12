import { Layout } from '@components/common'

export const getServerSideProps = async ({ params, query }) => {
  return {
    props: {
      params,
      query,
    },
  }
}

export default function TopLevelTaxonomyPage({ query }) {
  return (
    <div>
      <h1>{query.taxonomy} - Top Level</h1>
      <p>This is the top-level taxonomy page.</p>
    </div>
  )
}

TopLevelTaxonomyPage.Layout = Layout
