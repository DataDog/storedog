module Spree
  module OrderDecorator
    def self.prepended(base)
      base.state_machine.after_transition to: :complete, do: :log_successful_checkout
    end
    
    def log_successful_checkout

      # Get caller information for debugging
      caller_info = caller_locations(1, 1).first

      puts({
        message: "Order completed successfully",
        event: 'checkout_success',
        id: self.id,
        order_number: self.number,
        user_email: self.email,
        order_total: self.total,
        state: self.state,
        timestamp: self.completed_at,
        created_at: self.created_at,
        item_count: self.item_count,
        item_total: self.item_total,
        # Execution context
        file: __FILE__,
        line: __LINE__,
        method: __method__,
        caller_file: caller_info&.path,
        caller_line: caller_info&.lineno,
        caller_method: caller_info&.label
      }.to_json)
    end
  end

  Order.prepend(OrderDecorator)
end