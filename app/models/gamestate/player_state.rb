class PlayerState < Ohm::Model
  collection :lands, LandState
  reference :game_state, GameState

  attribute :seat_number
  attribute :is_turn
  attribute :username
  attribute :user_id
  attribute :state
  attribute :current_points
  attribute :current_delta_points
  attribute :current_place

  index :user_id
  index :is_turn
  index :state

  def validate
    assert_present :user_id
  end

  def as_json(options={})
    { :player_id => self.user_id.to_i,
      :seat_id => self.seat_number.to_i,
      :is_turn => self.is_turn == "true" ? true : false,
      :name => self.username,
      :state => self.state,
      :current_points => self.current_points.to_i,
      :place => self.current_place.to_i,
      :land_count => self.lands.size,
      :delta_points => self.current_delta_points.to_i }
  end
end