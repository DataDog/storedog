# Be sure to restart your server when you modify this file.

cookie_domain = ENV['COOKIE_DOMAIN'] == 'all' ? :all : ENV['COOKIE_DOMAIN']

Rails.application.config.session_store :cookie_store, 
  key: '_spree_starter_session', 
  domain: cookie_domain,
  expire_after: 12.hours,
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax
