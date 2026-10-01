class OrderWebhookJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: 5.seconds, attempts: 2

  def perform(order_id)
    order = Spree::Order.find(order_id)

    Rails.logger.info("Processing webhook for order: #{order.number}")
    OrderWebhookService.send_order_created(order)

  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Order not found for webhook: #{order_id}")
  rescue StandardError => e
    Rails.logger.error("Failed to process webhook for order #{order_id}: #{e.message}")
    raise # Will be retried by ActiveJob
  end
end
