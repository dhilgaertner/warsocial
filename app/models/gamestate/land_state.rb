class LandState < Ohm::Model
  attribute :deployment
  attribute :map_land_id

  reference :player_state, PlayerState
  reference :game_state, GameState

  index :map_land_id

  def validate

  end

  def as_json(options={})
    { :deployment => self.deployment.to_i,
      :land_id => self.map_land_id.to_i,
      :player_id => self.player_state != nil ? self.player_state.user_id.to_i : nil }
  end

end