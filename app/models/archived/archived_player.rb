class ArchivedPlayer < ActiveRecord::Base
  belongs_to :archived_game
  belongs_to :user

  attr_accessible :archived_game_id, :delta_points, :finishing_place, :seat_number, :user_id
end
