class GameRule < ActiveRecord::Base
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :game_name, :map_name, :player_count, :wager_level

  def self.calc_delta_points(position, wager, entries)
    prize_pot = wager == 0 ? (entries * 25) : (entries * wager)

    # Games with less than 4 players
    if (entries < 4)
      return position == 1 ? prize_pot : 0
    end

    # Games with more than 3 players
    case position
      when 1
        return (prize_pot * 0.6).to_i
      when 2
        return (prize_pot * 0.3).to_i
      when 3
        return (prize_pot * 0.1).to_i
      else
        return 0
    end
  end
end
