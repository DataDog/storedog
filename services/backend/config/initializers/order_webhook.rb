# Order Webhook Integration
#
# This initializer hooks into Spree's order state machine to send
# webhooks to the Kafka bridge service when orders are completed.
#
# The webhook is sent asynchronously via ActiveJob/Sidekiq to avoid
# blocking order completion.
#
# IMPORTANT: This is gracefully disabled if the webhook bridge service
# is not available, making the backend portable without Kafka dependencies.

Rails.application.config.to_prepare do
  # Only set up the hook if webhook is enabled
  next unless ENV['ORDER_WEBHOOK_ENABLED'] == 'true'

  # Check if webhook bridge is actually available
  webhook_available = begin
    uri = URI.parse(ENV.fetch('ORDER_WEBHOOK_URL', 'http://order-webhook-bridge:8081'))
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')
    http.open_timeout = 1
    http.read_timeout = 1

    request = Net::HTTP::Get.new('/health')
    response = http.request(request)
    
    response.code.to_i == 200
  rescue StandardError => e
    Rails.logger.info("Order webhook bridge not available: #{e.message}")
    false
  end

  if webhook_available
    Rails.logger.info("Order webhook integration enabled")
    Rails.logger.info("Webhook URL: #{ENV.fetch('ORDER_WEBHOOK_URL', 'http://order-webhook-bridge:8081')}")

    # Hook into Spree's order state machine
    # This fires when an order transitions to the 'complete' state
    Spree::Order.state_machine.after_transition(to: :complete) do |order, _transition|
      # Only send webhook if order is persisted to database
      if order.persisted?
        Rails.logger.info("Order #{order.number} completed, queuing webhook job")

        # Queue the webhook job asynchronously
        # This ensures order completion isn't delayed by webhook processing
        OrderWebhookJob.perform_later(order.id)
      end
    end
  else
    Rails.logger.info("Order webhook integration disabled - service not available")
  end
end
