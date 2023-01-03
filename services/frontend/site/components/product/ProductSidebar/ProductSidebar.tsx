import s from './ProductSidebar.module.css';
import { useAddItem } from '@framework/cart';
import { datadogRum } from '@datadog/browser-rum';
import { FC, useEffect, useState } from 'react';
import { ProductOptions } from '@components/product';
import useCart from '@framework/cart/use-cart';
import type { Product } from '@commerce/types/product';
import { Button, Text, Rating, Collapse, useUI } from '@components/ui';
import {
  getProductVariant,
  selectDefaultOptionFromProduct,
  SelectedOptions,
} from '../helpers';

interface ProductSidebarProps {
  product: Product;
  className?: string;
}

const ProductSidebar: FC<ProductSidebarProps> = ({ product, className }) => {
  const addItem = useAddItem();
  const { data: cartData } = useCart();
  const { openSidebar, setSidebarView } = useUI();
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  useEffect(() => {
    selectDefaultOptionFromProduct(product, setSelectedOptions);
  }, [product]);

  const variant = getProductVariant(product, selectedOptions);
  const addToCart = async () => {
    setLoading(true);
    try {
      await addItem({
        productId: String(product.id),
        variantId: String(variant ? variant.id : product.variants[0]?.id),
      });
      datadogRum.addAction('Product Added to Cart', {
        cartTotal: cartData.totalPrice,
        product: {
          name: product.name,
          sku: product.sku,
          id: product.id,
          price: product.price.value,
          slug: product.slug,
        },
      });

      setSidebarView('CART_VIEW');
      openSidebar();
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <ProductOptions
        options={product.options}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
      <Text
        className='pb-4 break-words w-full max-w-xl'
        html={product.descriptionHtml || product.description}
      />
      <div className='flex flex-row justify-between items-center'>
        <Rating value={4} />
        <div className='text-accent-6 pr-1 font-medium text-sm'>36 reviews</div>
      </div>
      <div>
        {process.env.COMMERCE_CART_ENABLED && (
          <Button
            aria-label='Add to Cart'
            type='button'
            id='add-to-cart-button'
            className={s.button}
            onClick={addToCart}
            loading={loading}
            disabled={variant?.availableForSale === false}
          >
            {variant?.availableForSale === false
              ? 'Not Available'
              : 'Add To Cart'}
          </Button>
        )}
      </div>
      <div className='mt-6'>
        <Collapse title='Details'>This product is not for resale!</Collapse>
      </div>
    </div>
  );
};

export default ProductSidebar;
