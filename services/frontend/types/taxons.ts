export type Taxon = {
  id: string
  type: string
  attributes: {
    name: string
    pretty_name: string
    permalink: string
    seo_title?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
  }
}
