class SeasonScore < ActiveRecord::Base
  belongs_to :season
  belongs_to :user

  attr_accessible :points


end
