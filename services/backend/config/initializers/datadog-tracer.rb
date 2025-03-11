Datadog.configure do |c|
  # c.service = ENV['DD_SERVICE'] || 'store-backend'
  # # Activates and configures an integration
  # c.tracing.instrument :pg, service_name: 'postgres'
  # c.tracing.instrument :aws, service_name: 'store-backend-aws'
  # c.tracing.instrument :dalli, service_name: 'store-backend-memcached'
  # c.tracing.instrument :active_support, cache_service: 'store-backend-cache'
end