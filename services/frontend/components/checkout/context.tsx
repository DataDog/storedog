import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useContext,
  createContext,
} from 'react'

import {
  listPaymentMethods,
  listShippingRates,
  updateCheckout,
  completeCheckout,
} from '@lib/api/checkout'
import { useCart } from '@lib/CartContext'
import type {
  PaymentAttributes,
  AddressAttributes,
} from '@customTypes/checkout'

export type State = {
  cardFields: PaymentAttributes
  addressFields: AddressAttributes
}

type CheckoutContextType = State & {
  shippingRate: any
  addressStatus: {
    ok: boolean | null
    message: any
  }
  paymentStatus: {
    ok: boolean | null
    message: any
  }
  setCardFields: (cardFields: PaymentAttributes) => void
  setAddressFields: (addressFields: AddressAttributes) => void
  clearCheckoutFields: () => void
  handleCompleteCheckout: () => void
}

type Action =
  | {
      type: 'SET_CARD_FIELDS'
      card: PaymentAttributes
    }
  | {
      type: 'SET_ADDRESS_FIELDS'
      address: AddressAttributes
    }
  | {
      type: 'CLEAR_CHECKOUT_FIELDS'
    }

const initialState: State = {
  cardFields: {
    payment_method_id: '1',
    source_attributes: {
      name: 'Jade Angelou',
      number: '4111111111111111',
      month: '01',
      year: '2027',
      verification_value: '123',
    },
  } as PaymentAttributes,
  addressFields: {
    firstname: 'Jade',
    lastname: 'Angelou',
    email: 'jade@ddtraining.datadoghq.com',
    address1: '32 Stenson Drive',
    address2: '',
    zipcode: '94016',
    city: 'San Francisco',
    phone: '555-555-5555',
    state_name: 'CA',
    country_iso: 'US',
  } as AddressAttributes,
}

export const CheckoutContext = createContext<State | any>(initialState)

CheckoutContext.displayName = 'CheckoutContext'

const checkoutReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CARD_FIELDS':
      return {
        ...state,
        cardFields: action.card,
      }
    case 'SET_ADDRESS_FIELDS':
      return {
        ...state,
        addressFields: action.address,
      }
    case 'CLEAR_CHECKOUT_FIELDS':
      return {
        ...state,
        cardFields: initialState.cardFields,
        addressFields: initialState.addressFields,
      }
    default:
      return state
  }
}

export const CheckoutProvider: FC = (props) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [shippingRate, setShippingRate] = useState<{
    id: string
    selected_rate_id: string
    price: number
  } | null>(null)
  const [addressStatus, setAddressError] = useState({ ok: null, message: null })
  const [paymentStatus, setPaymentError] = useState({ ok: null, message: null })
  const [shippingReady, setShippingReady] = useState(false)
  const { cart, cartToken, cartUser } = useCart()
  const hasLineItems = Boolean(cart?.lineItems.length)

  const getPaymentMethods = useCallback(async () => {
    // get payment methods
    const paymentMethods = await listPaymentMethods({ order_token: cartToken })
    // set payment methods
    setPaymentMethods(paymentMethods)
  }, [cartToken, setPaymentMethods])

  const checkoutChain = useRef(Promise.resolve())

  const syncCheckout = useCallback(
    async (address: AddressAttributes, payment: PaymentAttributes) => {
      setShippingReady(false)
      setPaymentError({ ok: null, message: null })

      const updatedAddress = await updateCheckout({
        order_token: cartToken,
        order: {
          email: address.email,
          bill_address_attributes: address,
          ship_address_attributes: address,
        },
      })

      if (updatedAddress.error) {
        throw updatedAddress.error
      }

      const shippingRates = await listShippingRates({ order_token: cartToken })
      const rate = {
        id: shippingRates.data[0].id,
        selected_rate_id:
          shippingRates.data[0].relationships.selected_shipping_rate.data.id,
        price: Number(shippingRates.data[0].attributes.final_price).toFixed(2),
      }
      setShippingRate(rate)

      const updatedShipping = await updateCheckout({
        order_token: cartToken,
        order: {
          shipments_attributes: [
            {
              id: rate.id,
              selected_shipping_rate_id: rate.selected_rate_id,
            },
          ],
        },
      })

      if (updatedShipping.error) {
        throw updatedShipping.error
      }

      setAddressError({ ok: true, message: null })

      if (payment.source_attributes.number) {
        const updatedPayment = await updateCheckout({
          order_token: cartToken,
          order: {
            payments_attributes: [payment],
          },
        })

        if (updatedPayment?.error) {
          throw updatedPayment.error
        }

        setPaymentError({ ok: true, message: null })
      }

      setShippingReady(true)
    },
    [cartToken]
  )

  const handleCompleteCheckout = useCallback(async () => {
    try {
      const completedCheckout = await completeCheckout({
        order_token: cartToken,
      })
      return completedCheckout
    } catch (error) {
      console.log(error)
    }
  }, [cartToken])

  const setCardFields = useCallback(
    (card: PaymentAttributes) => dispatch({ type: 'SET_CARD_FIELDS', card }),
    [dispatch]
  )

  const setAddressFields = useCallback(
    (address: AddressAttributes) =>
      dispatch({ type: 'SET_ADDRESS_FIELDS', address }),
    [dispatch]
  )

  const clearCheckoutFields = useCallback(
    () => dispatch({ type: 'CLEAR_CHECKOUT_FIELDS' }),
    [dispatch]
  )

  const cardFields = useMemo(() => state.cardFields, [state.cardFields])

  const addressFields = useMemo(
    () => state.addressFields,
    [state.addressFields]
  )

  useEffect(() => {
    if (cartToken) {
      getPaymentMethods()
    }
  }, [cartToken, getPaymentMethods])

  useEffect(() => {
    if (!cartToken || !hasLineItems || !addressFields.country_iso) {
      return
    }

    const address = addressFields
    const payment = cardFields
    checkoutChain.current = checkoutChain.current
      .then(() => syncCheckout(address, payment))
      .catch((error) => {
        console.log(error)
        setAddressError({ ok: false, message: error })
        setPaymentError({ ok: false, message: error })
        setShippingReady(false)
      })
  }, [hasLineItems, cartToken, addressFields, cardFields, syncCheckout])

  // set user name and email based on rum user
  useEffect(() => {
    if (cartUser && cartUser.name && cartUser.email) {
      setAddressFields({
        ...initialState.addressFields,
        email: cartUser.email,
        firstname: cartUser.name.split(' ')[0],
        lastname: cartUser.name.split(' ')[1],
      })
    }
  }, [cartUser, setAddressFields])

  const value = useMemo(
    () => ({
      cardFields,
      addressFields,
      shippingRate,
      shippingReady,
      addressStatus,
      paymentStatus,
      setCardFields,
      setAddressFields,
      clearCheckoutFields,
      handleCompleteCheckout,
    }),
    [
      cardFields,
      addressFields,
      shippingRate,
      shippingReady,
      addressStatus,
      paymentStatus,
      setCardFields,
      setAddressFields,
      clearCheckoutFields,
      handleCompleteCheckout,
    ]
  )

  return <CheckoutContext.Provider value={value} {...props} />
}

export const useCheckoutContext = () => {
  const context = useContext<CheckoutContextType>(CheckoutContext)
  if (context === undefined) {
    throw new Error(`useCheckoutContext must be used within a CheckoutProvider`)
  }
  return context
}
