class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

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
end
