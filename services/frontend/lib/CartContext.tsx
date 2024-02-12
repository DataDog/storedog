import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import {
  createCart,
  getCart,
  emptyCart,
  deleteCart,
  addToCart,
  removeFromCart,
  updateQuantity,
} from '@lib/api/cart'
import { datadogRum } from '@datadog/browser-rum'
import userData from '@config/user_data.json'
import type { Cart } from '@customTypes/cart'

type CartProviderProps = {
  children: ReactNode
}

type CartContextType = {
  cart: Cart | null
  cartToken: string
  cartError: any
  cartUser: any
  setCart: (cart: Cart | {}) => void
  cartInit: () => Promise<void>
  cartEmpty: () => Promise<void>
  cartDelete: () => Promise<void>
  cartAdd: (variantId: string, quantity: number) => Promise<any>
  cartRemove: (lineItemId: string) => Promise<any>
  cartUpdate: (lineItemId: string, quantity: number) => Promise<any>
}

export const CartContext = createContext<CartContextType>({
  cart: null,
  cartToken: null,
  cartError: null,
  cartUser: null,
  setCart: () => {},
  cartInit: async () => {},
  cartEmpty: async () => {},
  cartDelete: async () => {},
  cartAdd: async () => {},
  cartRemove: async () => {},
  cartUpdate: async () => {},
})

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartToken, setCartToken] = useState<string | null>(null)
  const [cartError, setCartError] = useState<any>()
  const [cartUser, setCartUser] = useState<any>()

  useEffect(() => {
    cartInit()
  }, [])

  useEffect(() => {
    localStorage.setItem('cartToken', cartToken || '')
  }, [cartToken])

  useEffect(() => {
    // if user exists in local storage, set user or create a new user
    if (localStorage.getItem('rum_user')) {
      const user = JSON.parse(localStorage.getItem('rum_user') || '')
      datadogRum.setUser(user)
      setCartUser(user)
    } else {
      const user = userData[Math.floor(Math.random() * userData.length)]
      datadogRum.setUser(user)
      localStorage.setItem('rum_user', JSON.stringify(user))
      setCartUser(user)
    }
  }, [])

  // init cart
  const cartInit = async () => {
    const cartToken = localStorage.getItem('cartToken')

    try {
      if (cartToken && cartToken !== 'undefined') {
        let cart = await getCart({
          order_token: cartToken,
          include:
            'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
        })

        if (!cart.id) {
          localStorage.removeItem('cartToken')
          cart = await createCart({
            include:
              'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
          })
          localStorage.setItem('cartToken', cart.customerId)
        }

        setCart(cart)
        setCartToken(cart.customerId)
        setCartError(null)
      } else {
        const cart = await createCart({
          include:
            'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
        })
        localStorage.setItem('cartToken', cart.customerId)
        setCart(cart)
        setCartToken(cart.customerId)
        setCartError(null)
        return cartToken
      }
    } catch (error) {
      console.log(error)
      setCartError(error)
    }
  }

  // empty cart
  const cartEmpty = async () => {
    try {
      if (cartToken) {
        await emptyCart({ order_token: cartToken })
      }
      setCart(null)
      setCartToken(null)
      setCartError(null)
    } catch (error) {
      console.log(error)
      setCartError(error)
    }
  }

  // delete cart
  const cartDelete = async () => {
    try {
      if (cartToken) {
        await deleteCart({ order_token: cartToken })
      }
      setCart(null)
      setCartToken(null)
      setCartError(null)
    } catch (error) {
      console.log(error)
      setCartError(error)
    }
  }

  // add to cart
  const cartAdd = async (variantId: string, quantity: number) => {
    try {
      if (cartToken) {
        const cart = await addToCart({
          order_token: cartToken,
          variant_id: variantId,
          quantity,
          include:
            'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
        })
        if (cart?.error) {
          throw new Error(cart.error)
        }

        setCart(cart)
        setCartError(null)
        return cart
      } else {
        const cartToken = await cartInit()
        const cart = await addToCart({
          order_token: cartToken || '',
          variant_id: variantId,
          quantity,
        })
        setCart(cart)
        setCartError(null)
        return cart
      }
    } catch (error) {
      console.log(error)
      setCartError(error)
      return { error }
    }
  }

  // remove from cart
  const cartRemove = async (lineItemId: string) => {
    try {
      if (cartToken) {
        const cart = await removeFromCart({
          order_token: cartToken,
          id: lineItemId,
          include:
            'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
        })

        if (!cart?.id) {
          throw new Error(cart)
        }

        setCart(cart)
        setCartError(null)
      } else {
        setCartError('Cart not found')
      }
    } catch (error) {
      console.log(error)
      setCartError(error)
    }
  }

  // update quantity
  const cartUpdate = async (lineItemId: string, quantity: number) => {
    try {
      if (cartToken) {
        const cart = await updateQuantity({
          order_token: cartToken,
          line_item_id: lineItemId,
          quantity,
          include:
            'line_items,variants,variants.images,billing_address,shipping_address,user,payments,shipments,promotions',
        })
        setCart(cart)
        setCartError(null)
      } else {
        setCartError('Cart not found')
      }
    } catch (error) {
      console.log(error)
      setCartError(error)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartToken,
        cartError,
        cartUser,
        setCart,
        cartInit,
        cartEmpty,
        cartDelete,
        cartAdd,
        cartRemove,
        cartUpdate,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
