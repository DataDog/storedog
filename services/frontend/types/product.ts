export interface Product {
  id: string
  name: string
  description: string
  descriptionHtml: string
  slug: string
  sku: string
  price: {
    value: number
    retailPrice: number
    currencyCode: string
  }
  path: string
  images: {
    url: string
    alt: string
  }[]
  variants?: {
    id: string | number
    options: {
      __typename?: 'MultipleChoiceOption'
      id: string
      displayName: string
      values: {
        label: string
        hexColors?: string[]
      }[]
    }[]
    availableForSale: boolean
  }[]
  options?: {
    __typename?: 'MultipleChoiceOption'
    id: string
    displayName: string
    values: {
      label: string
      hexColors?: string[]
    }[]
  }
}
