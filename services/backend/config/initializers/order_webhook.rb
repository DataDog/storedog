# Order Webhook Integration
#
# This initializer hooks into Spree's order state machine to send
# webhooks to the Kafka bridge service when orders are completed.
#
# The webhook is sent asynchronously via ActiveJob/Sidekiq to avoid
# blocking order completion.

Rails.application.config.to_prepare do
  # Only set up the hook if webhook is enabled
  next unless ENV['ORDER_WEBHOOK_ENABLED'] == 'true'

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
end
