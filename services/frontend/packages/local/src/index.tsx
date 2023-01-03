import {
  getCommerceProvider,
  useCommerce as useCoreCommerce,
} from '@vercel/commerce'
import { localProvider, LocalProvider } from './provider'

export { localProvider }
export type { LocalProvider }

export const CommerceProvider = getCommerceProvider(localProvider)

export const useCommerce = () => useCoreCommerce<LocalProvider>()
