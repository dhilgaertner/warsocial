class Land < ActiveRecord::Base
  belongs_to :game
  belongs_to :player
  
  attr_accessible :deployment, :map_land_id
  
  def as_json(options={})
    { :deployment => self.deployment, 
      :land_id => self.map_land_id, 
      :player_id => self.player != nil ? self.player.seat_number : nil }
  end
end
