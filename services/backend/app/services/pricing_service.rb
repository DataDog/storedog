# PricingService - HTTP client for the pricing microservice
#
# Handles communication with the Go pricing service for:
# - Single item price calculations
# - Cart total calculations with bulk discounts
#
class PricingService
  class Error < StandardError; end

  def initialize
    @base_url = ENV.fetch('PRICING_SERVICE_URL', 'http://pricing:5001')
    @timeout = ENV.fetch('PRICING_SERVICE_TIMEOUT', 5).to_i
  end

  # Calculate price for a single item
  #
  # @param product_id [Integer] The product ID
  # @param base_price [Float] The base price of the product
  # @param quantity [Integer] The quantity
  # @param discount_code [String, nil] Optional discount code
  # @return [Hash] Price calculation result
  def calculate(product_id:, base_price:, quantity: 1, discount_code: nil)
    payload = {
      product_id: product_id,
      base_price: base_price.to_f,
      quantity: quantity,
      discount_code: discount_code
    }.compact

    response = post('/calculate', payload)
    parse_response(response)
  end

  # Calculate prices for a full cart
  #
  # @param items [Array<Hash>] Array of cart items with :product_id, :base_price, :quantity, :name
  # @param discount_code [String, nil] Optional discount code
  # @return [Hash] Cart calculation result
  def calculate_cart(items:, discount_code: nil)
    payload = {
      items: items.map do |item|
        {
          product_id: item[:product_id].to_i,
          name: item[:name],
          base_price: item[:base_price].to_f,
          quantity: item[:quantity].to_i
        }
      end,
      discount_code: discount_code
    }.compact

    response = post('/calculate/cart', payload)
    parse_response(response)
  end

  # Get current pricing rules
  #
  # @return [Array<Hash>] Active pricing rules
  def rules
    response = get('/rules')
    parse_response(response)
  end

  # Health check
  #
  # @return [Boolean] true if service is healthy
  def healthy?
    response = get('/health')
    response.is_a?(Net::HTTPSuccess)
  rescue StandardError
    false
  end

  private

  def get(path)
    uri = URI("#{@base_url}#{path}")
    request = Net::HTTP::Get.new(uri)
    request['Content-Type'] = 'application/json'
    execute(uri, request)
  end

  def post(path, payload)
    uri = URI("#{@base_url}#{path}")
    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/json'
    request.body = payload.to_json
    execute(uri, request)
  end

  def execute(uri, request)
    http = Net::HTTP.new(uri.host, uri.port)
    http.open_timeout = @timeout
    http.read_timeout = @timeout
    http.request(request)
  rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Net::OpenTimeout, Net::ReadTimeout => e
    Rails.logger.warn("PricingService unavailable: #{e.message}")
    raise Error, "Pricing service unavailable: #{e.message}"
  end

  def parse_response(response)
    case response
    when Net::HTTPSuccess
      JSON.parse(response.body, symbolize_names: true)
    else
      Rails.logger.error("PricingService error: #{response.code} - #{response.body}")
      raise Error, "Pricing service error: #{response.code}"
    end
  end
end
