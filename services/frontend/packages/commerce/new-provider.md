# Adding a new Commerce Provider

🔔 New providers are on hold [until we have a new API for commerce](https://github.com/vercel/commerce/pull/252) 🔔

A commerce provider is a headless e-commerce platform that integrates with the [Commerce Framework](./README.md). Right now we have the following providers:

- Local ([packages/local](../local))
- Shopify ([packages/shopify](../shopify))
- Swell ([packages/swell](../swell))
- BigCommerce ([packages/bigcommerce](../bigcommerce))
- Vendure ([packages/vendure](../vendure))
- Saleor ([packages/saleor](../saleor))
- OrderCloud ([packages/ordercloud](../ordercloud))
- Spree ([packages/spree](../spree))
- Kibo Commerce ([packages/kibocommerce](../kibocommerce))
- Commerce.js ([packages/commercejs](../commercejs))
- SFCC - SalesForce Cloud Commerce ([packages/sfcc](../sfcc))

Adding a commerce provider means adding a new folder in `packages` with a folder structure like the next one:

- `src`
  - `api`
    - index.ts
  - `product`
    - usePrice
    - useSearch
    - getProduct
    - getAllProducts
  - `wishlist`
    - useWishlist
    - useAddItem
    - useRemoveItem
  - `auth`
    - useLogin
    - useLogout
    - useSignup
  - `customer`
    - useCustomer
    - getCustomerId
    - getCustomerWistlist
  - `cart`
    - useCart
    - useAddItem
    - useRemoveItem
    - useUpdateItem
  - `index.ts`
  - `provider.ts`
  - `commerce.config.json`
  - `next.config.cjs`
- `package.json`
- `tsconfig.json`
- `env.template`
- `README.md`

`provider.ts` exports a provider object with handlers for the [Commerce Hooks](./README.md#commerce-hooks) and `api/index.ts` exports a Node.js provider for the [Commerce API](./README.md#commerce-api)

> **Important:** We use TypeScript for every provider and expect its usage for every new one.

The app imports from the provider directly instead of the core commerce folder (`packages/commerce`), but all providers are interchangeable and to achieve it every provider always has to implement the core types and helpers.

## Updating the list of known providers

Open [/site/commerce-config.js](/site/commerce-config.js) and add the provider name to the list in `PROVIDERS`.

Then, open [/site/.env.template](/site/.env.template) and add the provider name to the list there too.

## Adding the provider hooks

Using BigCommerce as an example. The first thing to do is export a `CommerceProvider` component that includes a `provider` object with all the handlers that can be used for hooks:

```tsx
import { getCommerceProvider, useCommerce as useCoreCommerce } from '@vercel/commerce'
import { bigcommerceProvider, BigcommerceProvider } from './provider'

export { bigcommerceProvider }
export type { BigcommerceProvider }

export const CommerceProvider = getCommerceProvider(bigcommerceProvider)

export const useCommerce = () => useCoreCommerce<BigcommerceProvider>()
```

The exported types and components extend from the core ones exported by `@vercel/commerce`, which refers to `packages/commerce`.

The `bigcommerceProvider` object looks like this:

```tsx
import { handler as useCart } from './cart/use-cart'
import { handler as useAddItem } from './cart/use-add-item'
import { handler as useUpdateItem } from './cart/use-update-item'
import { handler as useRemoveItem } from './cart/use-remove-item'

import { handler as useWishlist } from './wishlist/use-wishlist'
import { handler as useWishlistAddItem } from './wishlist/use-add-item'
import { handler as useWishlistRemoveItem } from './wishlist/use-remove-item'

import { handler as useCustomer } from './customer/use-customer'
import { handler as useSearch } from './product/use-search'

import { handler as useLogin } from './auth/use-login'
import { handler as useLogout } from './auth/use-logout'
import { handler as useSignup } from './auth/use-signup'

import fetcher from './fetcher'

export const bigcommerceProvider = {
  locale: 'en-us',
  cartCookie: 'bc_cartId',
  fetcher,
  cart: { useCart, useAddItem, useUpdateItem, useRemoveItem },
  wishlist: {
    useWishlist,
    useAddItem: useWishlistAddItem,
    useRemoveItem: useWishlistRemoveItem,
  },
  customer: { useCustomer },
  products: { useSearch },
  auth: { useLogin, useLogout, useSignup },
}

export type BigcommerceProvider = typeof bigcommerceProvider
```

The provider object, in this case `bigcommerceProvider`, has to match the `Provider` type defined in [packages/commerce](./src/index.tsx).

A hook handler, like `useCart`, looks like this:

```tsx
import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useCart, { UseCart } from '@vercel/commerce/cart/use-cart'
import type { GetCartHook } from '@vercel/commerce/types/cart'

export default useCart as UseCart<typeof handler>

export const handler: SWRHook<GetCartHook> = {
  fetchOptions: {
    url: '/api/cart',
    method: 'GET',
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })

      return useMemo(
        () =>
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.lineItems.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        [response]
      )
    },
}
```

In the case of data fetching hooks like `useCart` each handler has to implement the `SWRHook` type that's defined in the core types. For mutations it's the `MutationHook`, e.g for `useAddItem`:

```tsx
import { useCallback } from 'react'
import type { MutationHook } from '@vercel/commerce/utils/types'
import { CommerceError } from '@vercel/commerce/utils/errors'
import useAddItem, { UseAddItem } from '@vercel/commerce/cart/use-add-item'
import type { AddItemHook } from '@vercel/commerce/types/cart'
import useCart from './use-cart'

export default useAddItem as UseAddItem<typeof handler>

export const handler: MutationHook<AddItemHook> = {
  fetchOptions: {
    url: '/api/cart',
    method: 'POST',
  },
  async fetcher({ input: item, options, fetch }) {
    if (
      item.quantity &&
      (!Number.isInteger(item.quantity) || item.quantity! < 1)
    ) {
      throw new CommerceError({
        message: 'The item quantity has to be a valid integer greater than 0',
      })
    }

    const data = await fetch({
      ...options,
      body: { item },
    })

    return data
  },
  useHook:
    ({ fetch }) =>
    () => {
      const { mutate } = useCart()

      return useCallback(
        async function addItem(input) {
          const data = await fetch({ input })
          await mutate(data, false)
          return data
        },
        [fetch, mutate]
      )
    },
}
```

## Showing progress and features
When creating a PR for a new provider, include this list in the PR description and mark the progress as you push so we can organize the code review. Not all points are required (but advised) so make sure to keep the list up to date.

**Status**

* [ ]  CommerceProvider
* [ ]  Schema & TS types
* [ ]  API Operations - Get all collections
* [ ]  API Operations - Get all pages
* [ ]  API Operations - Get all products
* [ ]  API Operations - Get page
* [ ]  API Operations - Get product
* [ ]  API Operations - Get Shop Info (categories and vendors working — `vendors` query still a WIP PR on Reaction)
* [ ]  Hook - Add Item
* [ ]  Hook - Remove Item
* [ ]  Hook - Update Item
* [ ]  Hook - Get Cart (account-tied carts working, anonymous carts working, cart reconciliation working)
* [ ]  Auth (based on a WIP PR on Reaction - still need to implement refresh tokens)
* [ ]  Customer information
* [ ]  Product attributes - Size, Colors
* [ ]  Custom checkout
* [ ]  Typing (in progress)
* [ ]  Tests
