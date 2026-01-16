# Decorator for Spree::Api::V2::Storefront::CartController
#
# Enriches cart responses with dynamic pricing calculations from the pricing service.
# Applies bulk discounts based on quantity and shows savings.
# Falls back to standard Spree pricing if the pricing service is unavailable.
#
module Spree
  module Api
    module V2
      module Storefront
        module CartControllerDecorator
          def self.prepended(base)
            base.class_eval do
              after_action :enrich_cart_with_pricing, only: [:show, :add_item, :set_quantity, :remove_line_item]
            end
          end

          private

          def enrich_cart_with_pricing
            return unless response.successful?
            return unless pricing_enabled?

            begin
              body = JSON.parse(response.body)
              enriched = enrich_cart(body)
              response.body = enriched.to_json
            rescue PricingService::Error => e
              Rails.logger.warn("Cart pricing enrichment skipped: #{e.message}")
            rescue JSON::ParserError => e
              Rails.logger.error("Failed to parse cart response for pricing: #{e.message}")
            end
          end

          def enrich_cart(body)
            cart = body['data']
            included = body['included'] || []
            return body unless cart

            # Extract line items from included resources
            line_items = included.select { |r| r['type'] == 'line_item' }
            return body if line_items.empty?

            # Build cart items for pricing service
            cart_items = line_items.map do |line_item|
              attrs = line_item['attributes']
              {
                product_id: extract_product_id(line_item, included),
                name: attrs['name'],
                base_price: attrs['price'].to_f,
                quantity: attrs['quantity'].to_i
              }
            end

            # Get discount code if applied
            discount_code = extract_discount_code(cart, included)

            # Calculate cart pricing
            pricing_result = pricing_service.calculate_cart(
              items: cart_items,
              discount_code: discount_code
            )

            # Enrich cart attributes with pricing info
            cart['attributes']['pricing'] = {
              'subtotal' => pricing_result[:subtotal],
              'total_discount' => pricing_result[:total_discount],
              'calculated_total' => pricing_result[:total],
              'rules_applied' => pricing_result[:rules_applied] || [],
              'calculated_at' => pricing_result[:calculated_at]
            }

            # Enrich individual line items
            enrich_line_items(line_items, pricing_result[:items] || [])

            body
          end

          def enrich_line_items(line_items, pricing_items)
            pricing_by_product = pricing_items.index_by { |i| i[:product_id] }

            line_items.each do |line_item|
              product_id = extract_product_id(line_item, [])
              pricing = pricing_by_product[product_id]
              next unless pricing

              line_item['attributes']['pricing'] = {
                'unit_price' => pricing[:unit_price],
                'line_total' => pricing[:line_total],
                'discount' => pricing[:discount],
                'rules_applied' => pricing[:rules_applied] || []
              }
            end
          end

          def extract_product_id(line_item, included)
            # Try to get product_id from variant relationship
            variant_ref = line_item.dig('relationships', 'variant', 'data')
            return nil unless variant_ref

            variant = included.find { |r| r['type'] == 'variant' && r['id'] == variant_ref['id'] }
            return variant_ref['id'].to_i unless variant

            # Get product from variant
            product_ref = variant.dig('relationships', 'product', 'data')
            product_ref ? product_ref['id'].to_i : variant_ref['id'].to_i
          end

          def extract_discount_code(cart, included)
            # Look for applied promotion codes
            promotions_ref = cart.dig('relationships', 'promotions', 'data')
            return nil unless promotions_ref&.any?

            promotion = included.find { |r| r['type'] == 'promotion' && r['id'] == promotions_ref.first['id'] }
            promotion&.dig('attributes', 'code')
          end

          def pricing_service
            @pricing_service ||= PricingService.new
          end

          def pricing_enabled?
            ENV.fetch('PRICING_SERVICE_ENABLED', 'true') == 'true'
          end
        end
      end
    end
  end
end

Spree::Api::V2::Storefront::CartController.prepend(
  Spree::Api::V2::Storefront::CartControllerDecorator
)
