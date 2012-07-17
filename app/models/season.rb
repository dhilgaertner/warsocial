class Season < ActiveRecord::Base
  has_many :season_scores, :dependent => :destroy

  attr_accessible :name

  def self.record_new_season
    all_users = User.all

    Season.transaction do
      season = Season.create(:name => "Not yet named.")

      all_users.each do |user|
        ss = SeasonScore.create(:points => user.current_points)

        season.season_scores << ss
        user.season_scores << ss

        user.total_points = user.total_points + user.current_points
        user.current_points = 0

        season.save
        user.save
      end
    end

    return all_users.size
  end
end
