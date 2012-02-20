class Player < ActiveRecord::Base
  belongs_to :game
  belongs_to :user
  has_many :lands
  
  DEFAULT_PLAYER_STATE = "waiting"
  PLAYING_PLAYER_STATE = "playing"
  DEAD_PLAYER_STATE = "dead"
  
  attr_accessible :seat_number, :is_turn, :user, :state
  
  def as_json(options={})
    { :player_id => self.user.id, 
      :seat_id => self.seat_number, 
      :is_turn => is_turn, 
      :name => user.username, 
      :state => self.state }
  end
end
