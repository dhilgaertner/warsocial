
AdminData.config do |config|
  config.is_allowed_to_view = true # lambda {|controller| return true if Rails.env.development? }
  config.is_allowed_to_update = lambda {|controller| return true if Rails.env.development? }
end
