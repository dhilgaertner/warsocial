class LandState < Ohm::Model
  attribute :deployment
  attribute :map_land_id

  reference :player, PlayerState
  reference :game_state, GameState

  def validate

  end

  def as_json(options={})
    { :deployment => self.deployment,
      :land_id => self.map_land_id,
      :player_id => self.player.user_id }
  end
end