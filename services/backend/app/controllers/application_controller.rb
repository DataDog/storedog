require 'json'

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :log_request_started
  after_action :log_request_completed
  around_action :log_request_failures

  def otel_test
    tracer = OpenTelemetry.tracer_provider.tracer('backend-test', '1.0.0')
    
    tracer.in_span('otel-test-span') do |span|
      span.set_attribute('test.attribute', 'backend-rails')
      span.set_attribute('test.timestamp', Time.now.to_i)
      span.add_event('Test event from Rails backend')
      
      # Simulate some work
      sleep(0.1)
      
      # Create a child span
      tracer.in_span('database-simulation') do |child_span|
        child_span.set_attribute('db.operation', 'SELECT')
        child_span.set_attribute('db.table', 'products')
        sleep(0.05)
      end
    end
    
    render json: { 
      message: 'OpenTelemetry test completed', 
      service: ENV['OTEL_SERVICE_NAME'],
      timestamp: Time.now.iso8601
    }
  end

  private

  def log_request_started
    log_backend_event('request_started')
  end

  def log_request_completed
    log_backend_event('request_completed')
  end

  def log_request_failures
    yield
  rescue StandardError => err
    log_backend_event(
      'request_failed',
      level: :error,
      error_class: err.class.name,
      error_message: err.message
    )
    raise
  end

  def log_backend_event(event, level: :info, **fields)
    payload = request_log_context.merge(fields)
    payload[:event] = event
    Rails.logger.public_send(level, JSON.generate(payload))
  end

  def request_log_context
    span_context = OpenTelemetry::Trace.current_span.context
    {
      service: ENV.fetch('OTEL_SERVICE_NAME', 'backend'),
      path: request.path,
      method: request.request_method,
      format: request.format&.to_s,
      status: response.status,
      controller: controller_name,
      action: action_name,
      trace_id: span_context.hex_trace_id,
      span_id: span_context.hex_span_id
    }.compact
  end
end
