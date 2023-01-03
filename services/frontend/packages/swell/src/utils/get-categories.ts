import { SwellConfig } from '../api'
import { Category } from '../types/site'

const getCategories = async (config: SwellConfig): Promise<Category[]> => {
  const data = await config.fetch('categories', 'get')
  return (
    data.results.map(({ id, name, slug }: any) => ({
      id,
      name,
      slug,
      path: `/${slug}`,
    })) ?? []
  )
}

export default getCategories
