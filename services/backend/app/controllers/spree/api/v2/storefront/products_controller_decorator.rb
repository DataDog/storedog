# Decorator for Spree::Api::V2::Storefront::ProductsController
#
# Enriches product responses with dynamic pricing from the pricing service.
# Falls back to standard Spree pricing if the pricing service is unavailable.
#
module Spree
  module Api
    module V2
      module Storefront
        module ProductsControllerDecorator
          def self.prepended(base)
            base.class_eval do
              after_action :enrich_with_pricing, only: [:index, :show]
            end
          end

          private

          def enrich_with_pricing
            return unless response.successful?
            return unless pricing_enabled?

            begin
              body = JSON.parse(response.body)
              enriched = enrich_products(body)
              response.body = enriched.to_json
            rescue PricingService::Error => e
              Rails.logger.warn("Pricing enrichment skipped: #{e.message}")
            rescue JSON::ParserError => e
              Rails.logger.error("Failed to parse response for pricing: #{e.message}")
            end
          end

          def enrich_products(body)
            products = body['data']
            return body unless products

            # Handle both single product (show) and array (index)
            products = [products] unless products.is_a?(Array)

            products.each do |product|
              next unless product['attributes']

              price = product['attributes']['price'].to_f
              product_id = product['id'].to_i

              # Get pricing info (quantity 1 for product listing)
              pricing = pricing_service.calculate(
                product_id: product_id,
                base_price: price,
                quantity: 1
              )

              # Add pricing metadata to product attributes
              product['attributes']['pricing'] = {
                'base_price' => pricing[:base_price],
                'unit_price' => pricing[:unit_price],
                'rules_available' => pricing[:rules_applied]&.any? || false,
                'bulk_discount_available' => bulk_discount_available?(product_id)
              }
            end

            body
          end

          def bulk_discount_available?(product_id)
            # Check if any bulk discount rules apply to this product
            rules = pricing_service.rules
            rules.any? { |rule| rule[:min_quantity].to_i > 1 }
          rescue PricingService::Error
            false
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

Spree::Api::V2::Storefront::ProductsController.prepend(
  Spree::Api::V2::Storefront::ProductsControllerDecorator
)
