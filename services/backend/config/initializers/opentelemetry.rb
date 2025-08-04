require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'

# Get service name for logging before configuration
service_name = ENV['OTEL_SERVICE_NAME'] || 'backend'

# Configure OpenTelemetry for Rails auto-instrumentation
OpenTelemetry::SDK.configure do |c|
  # Service information
  c.service_name = service_name
  c.service_version = ENV['OTEL_SERVICE_VERSION'] || '1.0.0'
  
  # Configure the OTLP exporter (default for SDK.configure)
  # Environment variables will be used for endpoint configuration
  
  # Auto-instrument common Ruby/Rails libraries
  c.use_all() # This enables all available auto-instrumentations
  
  # Alternative: Enable specific instrumentations only
  # c.use 'OpenTelemetry::Instrumentation::Rails'
  # c.use 'OpenTelemetry::Instrumentation::ActiveRecord'
  # c.use 'OpenTelemetry::Instrumentation::ActionPack'
  # c.use 'OpenTelemetry::Instrumentation::ActionView'
  # c.use 'OpenTelemetry::Instrumentation::ActiveJob'
  # c.use 'OpenTelemetry::Instrumentation::Net::HTTP'
  # c.use 'OpenTelemetry::Instrumentation::Redis'
  # c.use 'OpenTelemetry::Instrumentation::Sidekiq'
end

Rails.logger.info "OpenTelemetry configured for service: #{service_name}" 