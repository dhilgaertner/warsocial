class Player < ActiveRecord::Base
  belongs_to :game
  belongs_to :user
  
  attr_accessible :seat_number, :is_turn, :user
  
end
