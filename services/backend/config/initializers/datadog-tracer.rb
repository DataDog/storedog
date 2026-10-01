if ENV['WORKER'] == 'true'
  Datadog.configure do |c|
    c.service = ENV['DD_SERVICE'] || 'store-worker'
    # Activates and configures an integration
    c.tracing.instrument :sidekiq, tag_args: true, distributed_tracing: true
    c.tracing.instrument :pg
    c.tracing.instrument :active_support
    c.tracing.instrument :redis
  end
else
  Datadog.configure do |c|
    c.service = ENV['DD_SERVICE'] || 'store-backend'
    # Activates and configures an integration
    c.tracing.instrument :sidekiq, distributed_tracing: true
    c.tracing.instrument :pg
    c.tracing.instrument :active_support
    c.tracing.instrument :redis
  end
end
