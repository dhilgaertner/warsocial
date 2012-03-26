class PlayerState < Ohm::Model
  collection :lands, LandState
  reference :game_state, GameState

  attribute :seat_number
  attribute :is_turn
  attribute :username
  attribute :user_id
  attribute :state

  index :user_id

  def validate
    assert_present :user_id
  end

  def as_json(options={})
    { :player_id => self.user_id,
      :seat_id => self.seat_number,
      :is_turn => self.is_turn,
      :name => self.username,
      :state => self.state }
  end
end