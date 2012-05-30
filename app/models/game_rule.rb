class GameRule < ActiveRecord::Base
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :game_name, :map_name, :player_count, :wager_level

  # @param [int] position - This is the position you finished in. (ex. 1, 2, 3, 4, 5, 6, 7)
  # @param [int] wager    - This is the ante for the table. (ex. 0, 100, 500, 2000, etc)
  # @param [int] entries  - This is the number of players that started the game. (ex. 1, 2, 3, 4, 5, 6, 7)
  # @return [int] - This function returns the resulting points change given the position, ante, and number of players
  def self.calc_delta_points(position, wager, entries)
    real_wager = wager == 0 ? 25 : wager
    prize_pot = (entries * real_wager)
    first_bonus = (entries - 1) * 25

    if (entries > 3)
      case position
        when 1
          return ((prize_pot - real_wager) * 0.6) + first_bonus
        when 2
          return ((prize_pot - real_wager) * 0.4)
        else
          return 0 - real_wager
      end
    else
      case position
        when 1
          return prize_pot + first_bonus - real_wager
        else
          return 0 - real_wager
      end
    end
  end

end
