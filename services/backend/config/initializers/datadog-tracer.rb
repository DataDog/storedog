Datadog.configure do |c|
  c.env = ENV['DD_ENV'] || 'development'
  c.service = ENV['DD_SERVICE'] || 'store-backend'
  c.tracing.sampling.default_rate = 1.0
end