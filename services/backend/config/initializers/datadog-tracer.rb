if ENV['WORKER'] == 'true'
  Datadog.configure do |c|
    c.service = ENV['DD_SERVICE'] || 'store-worker'
    # Activates and configures an integration
    c.tracing.instrument :sidekiq, tag_args: true
    c.tracing.instrument :pg, service_name: 'postgres'
    c.tracing.instrument :active_support, cache_service: 'store-worker-cache'
    c.tracing.instrument :redis, service_name: 'store-worker-redis'
  end
else
  Datadog.configure do |c|
    c.service = ENV['DD_SERVICE'] || 'store-backend'
    # Activates and configures an integration
    c.tracing.instrument :pg, service_name: 'postgres'
    c.tracing.instrument :dalli, service_name: 'store-backend-memcached'
    c.tracing.instrument :active_support, cache_service: 'store-backend-cache'
  end
end