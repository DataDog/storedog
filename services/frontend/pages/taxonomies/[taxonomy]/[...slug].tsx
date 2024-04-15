// pages/[taxonomy]/[...slug].js

import { useRouter } from 'next/router'

const TaxonomyPage = () => {
  const router = useRouter()
  const { taxonomy, slug } = router.query

  return (
    <div>
      <h1>{taxonomy}</h1>
      <p>Slug: {slug?.join('/')}</p>
    </div>
  )
}

export default TaxonomyPage
