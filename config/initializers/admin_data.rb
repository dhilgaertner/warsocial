
AdminData.config do |config|
  config.is_allowed_to_view = lambda {|controller| return true }
  config.is_allowed_to_update = lambda {|controller| return true } # if Rails.env.development?
end
