import React, {
  FC,
  useState,
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
  ShippingRateAttributes,
} from '@customTypes/checkout'

export type State = {
  cardFields: PaymentAttributes
  addressFields: AddressAttributes
}

type CheckoutContextType = State & {
  shippingRate: ShippingRateAttributes
  addressError: any
  paymentError: any
  setCardFields: (cardFields: PaymentAttributes) => void
  setAddressFields: (addressFields: AddressAttributes) => void
  clearCheckoutFields: () => void
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
  const [shippingRate, setShippingRate] = useState({})
  const [addressError, setAddressError] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const { cartToken } = useCart()

  // may not need to use this, yet, as we only offer dummy checkouts (but can open up to `check` or other sandboxed payment methods in the future)
  const getPaymentMethods = useCallback(async () => {
    // get payment methods
    const paymentMethods = await listPaymentMethods({ order_token: cartToken })
    console.log(paymentMethods)
    // set payment methods
    setPaymentMethods(paymentMethods)
  }, [cartToken, setPaymentMethods])

  const getShippingRates = useCallback(async () => {
    // get shipping rates
    const shippingRates = await listShippingRates({ order_token: cartToken })
    setShippingRate(shippingRates.data[0])
  }, [cartToken, setShippingRate])

  const updateAddress = useCallback(
    async (address: AddressAttributes) => {
      try {
        const updatedCheckout = await updateCheckout({
          order_token: cartToken,
          order: {
            email: address.email,
            bill_address_attributes: address,
            ship_address_attributes: address,
          },
        })

        if (updatedCheckout.error) {
          throw updatedCheckout.error
        }

        setAddressError(null)
      } catch (error) {
        console.log(error)
        setAddressError(error)
      }
    },
    [cartToken]
  )

  const updatePayment = useCallback(
    async (payment: PaymentAttributes) => {
      try {
        const updatedCheckout = await updateCheckout({
          order_token: cartToken,
          order: {
            payments_attributes: [payment],
          },
        })
        console.log(updatedCheckout)
        setPaymentError(null)
      } catch (error) {
        console.log(error)
        setPaymentError(error)
      }
    },
    [cartToken]
  )

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
    if (cartToken && addressFields.country_iso) {
      updateAddress(addressFields)
    }
  }, [cartToken, addressFields, updateAddress])

  useEffect(() => {
    if (cartToken && cardFields.source_attributes.number) {
      updatePayment(cardFields)
    }
  }, [cartToken, cardFields, updatePayment])

  const value = useMemo(
    () => ({
      cardFields,
      addressFields,
      shippingRate,
      addressError,
      paymentError,
      setCardFields,
      setAddressFields,
      clearCheckoutFields,
    }),
    [
      cardFields,
      addressFields,
      shippingRate,
      addressError,
      paymentError,
      setCardFields,
      setAddressFields,
      clearCheckoutFields,
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