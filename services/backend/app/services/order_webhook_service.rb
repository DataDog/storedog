class OrderWebhookService
  require 'net/http'
  require 'json'
  require 'uri'

  class << self
    def send_order_created(order)
      return unless enabled?

      begin
        payload = build_payload(order)
        response = post_webhook(payload)

        Rails.logger.info("✓ Order webhook sent for #{order.number}: #{response.code}")
        true
      rescue StandardError => e
        # Log but don't fail order - webhook is fire-and-forget
        Rails.logger.error("✗ Order webhook failed for #{order.number}: #{e.message}")
        false
      end
    end

    private

    def enabled?
      ENV['ORDER_WEBHOOK_ENABLED'] == 'true'
    end

    def webhook_url
      base_url = ENV.fetch('ORDER_WEBHOOK_URL', 'http://order-webhook-bridge:8081')
      "#{base_url}/webhooks/order-created"
    end

    def build_payload(order)
      {
        order_id: order.number,
        customer_id: order.user_id&.to_s || 'guest',
        email: order.email,
        total: (order.total * 100).to_i, # Convert to cents
        currency: order.currency,
        items: build_line_items(order),
        shipping_address: build_address(order.ship_address),
        billing_address: build_address(order.bill_address),
        payment_method: extract_payment_method(order),
        completed_at: order.completed_at&.iso8601
      }
    end

    def build_line_items(order)
      order.line_items.map do |item|
        {
          product_id: item.variant.product.id.to_s,
          product_name: item.variant.product.name,
          sku: item.variant.sku || "SKU-#{item.variant.id}",
          quantity: item.quantity,
          unit_price_cents: (item.price * 100).to_i
        }
      end
    end

    def build_address(address)
      return nil unless address

      {
        street: [address.address1, address.address2].compact.join(' ').strip,
        city: address.city,
        state: address.state_text,
        postal_code: address.zipcode,
        country: address.country&.name || '',
        country_code: address.country&.iso || ''
      }
    end

    def extract_payment_method(order)
      payment = order.payments.valid.first
      return 'Unknown' unless payment

      payment.payment_method&.name || 'Credit Card'
    end

    def post_webhook(payload)
      uri = URI.parse(webhook_url)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == 'https')
      http.open_timeout = 2
      http.read_timeout = 2

      request = Net::HTTP::Post.new(uri.path)
      request['Content-Type'] = 'application/json'
      request.body = payload.to_json

      http.request(request)
    end
  end
end
