Rails.application.routes.draw do
  # Spree routes
  mount Spree::Core::Engine, at: '/'

  # Custom API routes
  namespace :api do
    namespace :v2 do
      # Define a custom route for 'about-us-api'
      get 'about-us-api', to: 'custom#about_us'
    end
  end

  # sidekiq web UI
  require 'sidekiq/web'
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    username == Rails.application.secrets.sidekiq_username &&
      password == Rails.application.secrets.sidekiq_password
  end
  mount Sidekiq::Web, at: '/sidekiq'
end
