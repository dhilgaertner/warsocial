class GameRule < ActiveRecord::Base
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :game_name, :map_name, :player_count, :wager_level

  def self.calc_delta_points(position, wager, entries)
    real_wager = wager == 0 ? 25 : wager
    prize_pot = (entries * real_wager)

    case position
      when 1
        return prize_pot - real_wager
      else
        return 0 - real_wager
    end
  end
end
