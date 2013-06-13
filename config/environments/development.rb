Dice::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  $stdout.sync = true

  # In the development environment your application's code is reloaded on
  # every request.  This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true

  # Show full error reports and disable caching
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger
  config.active_support.deprecation = :log

  # Only use best-standards-support built into browsers
  config.action_dispatch.best_standards_support = :builtin

  # Do not compress assets
  config.assets.compress = false

  # Expands the lines which load the assets
  config.assets.debug = false
  
  # Requirement of Devise Gem Installation (Dustin)
  config.action_mailer.default_url_options = { :host => 'localhost:3000' }
  
  require 'pusher'

  Pusher.app_id = '43025'
  Pusher.key    = 'd3be744092460e80b964'
  Pusher.secret = '50ec4403a2acb5717fbc'

  ENV["REDISCLOUD_URL"] = 'redis://127.0.0.1:6379/'
  ENV["REDIS_URL"] = 'redis://127.0.0.1:6379/'
  #ENV["REDISCLOUD_URL"] = 'redis://rediscloud:wHpITF0hSUmJsWuF@pub-redis-18936.us-east-1-1.1.ec2.garantiadata.com:18936'
  #ENV["REDIS_URL"] = 'redis://rediscloud:wHpITF0hSUmJsWuF@pub-redis-18936.us-east-1-1.1.ec2.garantiadata.com:18936'
end
