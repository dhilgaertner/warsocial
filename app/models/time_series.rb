class TimeSeries < ActiveRecord::Base
  attr_accessible :key, :name, :value, :created_at
end
