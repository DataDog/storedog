/* 
SAMPLE ORDER BODY (working)
"order": {
    "email": "john@snow.org",
    "bill_address_attributes": {
      "firstname": "John",
      "lastname": "Snow",
      "address1": "7735 Old Georgetown Road",
      "city": "Bethesda",
      "phone": "3014445002",
      "zipcode": "20814",
      "state_name": "MD",
      "country_iso": "US"
    },
    "ship_address_attributes": {
      "firstname": "John",
      "lastname": "Snow",
      "address1": "7735 Old Georgetown Road",
      "city": "Bethesda",
      "phone": "3014445002",
      "zipcode": "20814",
      "state_name": "MD",
      "country_iso": "US"
    }
  },
  // will likely always be `1`
  "payments_attributes": [
    {
      "payment_method_id": "1",
      "source_attributes": {
        "name": "John Doe",
        "number": "4111111111111111",
        "month": "1",
        "year": "2025",
        "verification_value": "123",
        "cc_type": "visa" // Optional, Spree can auto-detect this based on the number
      }
    }
  ],
  // pull from listShippingRates
  "shipments_attributes": [
    {
      "id": "1",
      "selected_shipping_rate_id": "1"
    }
  ]

*/

// update checkout types
export type ShippingRateAttributes = {
  id: string
  selected_shipping_rate_id: string
}

export type AddressAttributes = {
  firstname: string
  lastname: string
  address1: string
  address2?: string
  city: string
  phone: string
  zipcode: string
  state_name: string
  country_iso: string
  email: string
}

export type PaymentAttributes = {
  payment_method_id: string | '1'
  source_attributes: {
    gateway_payment_profile_id?: string
    number: string | '4111111111111111'
    name: string | 'Bits the Dog'
    month: string | '01'
    year: string | '2027'
    cc_type: string | 'visa'
    verification_value: string | '123'
  }
}

export interface CheckoutBase {
  bearer_token?: string
  order_token?: string
  [key: string]: any
}

export interface UpdateCheckout extends CheckoutBase {
  order: {
    email?: string
    bill_address_attributes?: AddressAttributes
    ship_address_attributes?: AddressAttributes
    shipments_attributes?: ShippingRateAttributes[]
    payments_attributes?: PaymentAttributes[]
  }
}
