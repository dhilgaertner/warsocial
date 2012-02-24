class GameRule < ActiveRecord::Base
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :game_name, :map_name, :player_count
  
end
