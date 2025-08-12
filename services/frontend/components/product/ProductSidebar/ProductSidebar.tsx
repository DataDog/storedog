import s from './ProductSidebar.module.css'
import { datadogRum } from '@datadog/browser-rum'
import { FC, useEffect, useState } from 'react'
import { useCart } from '@lib/CartContext'
import type { Product } from '@customTypes/product'
import { Button, Text, Collapse, useUI } from '@components/ui'

interface ProductSidebarProps {
  product: Product
  className?: string
}

const ProductSidebar: FC<ProductSidebarProps> = ({ product, className }) => {
  const { cart, cartAdd, cartError } = useCart()
  const { openSidebar, setSidebarView } = useUI()
  const [loading, setLoading] = useState(false)
  const [variant, setVariant] = useState<any>(null)

  useEffect(() => {
    if (!product) return
    setVariant(product.variants[0])
  }, [product])

  const addToCart = async () => {
    setLoading(true)
    try {
      const cartRes = await cartAdd(
        String(variant ? variant.id : product.variants[0]?.id),
        1
      )

      if (cartRes.error) {
        throw new Error(cartRes.error)
      }

      datadogRum.addAction('Product Added to Cart', {
        cartTotal: cart.totalPrice,
        product: {
          name: product.name,
          sku: product.sku,
          id: product.id,
          price: product.price.value,
          slug: product.slug,
          variantName: variant.attributes.name || 'default',
        },
      })

      setSidebarView('CART_VIEW')
      openSidebar()
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Text
        className="pb-4 break-words w-full max-w-xl"
        html={product.descriptionHtml || product.description}
      />

      {cartError && (
        <div className="text-red border border-red p-1 mb-2">
          {cartError.message}
        </div>
      )}
      <div>
        {product.variants && product.variants.length > 1 ? (
          <select
            value={variant?.id}
            id="variant-select"
            data-dd-action-name="Variant select dropdown"
            className="my-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-12 text-gray-900 bg-white ring-1 ring-inset ring-gray-300 focus:ring-pink focus:outline-none sm:text-sm sm:leading-6"
            onChange={(e) => {
              const selectedVariant = product.variants.find(
                (v) => v.id === e.target.value
              )
              setVariant(selectedVariant)
            }}
          >
            {product.variants
              .filter((v: any) => v.availableForSale)
              .map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.attributes.name}
                </option>
              ))}
          </select>
        ) : null}
        <Button
          aria-label="Add to Cart"
          type="button"
          id="add-to-cart-button"
          className={s.button}
          onClick={addToCart}
          loading={loading}
          disabled={variant?.availableForSale === false}
        >
          {variant?.availableForSale === false
            ? 'Not Available'
            : 'Add To Cart'}
        </Button>
      </div>
      <div className="mt-6">
        <Collapse title="Details">This product is not for resale!</Collapse>
      </div>
    </div>
  )
}

export default ProductSidebar
