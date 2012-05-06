class ActiveLand

  attr_accessor :game_id, :map_land_id, :deployment, :player_id

  def initialize(game_id, map_land_id, deployment, player_id=nil)
    self.game_id = game_id
    self.map_land_id = map_land_id.to_i
    self.deployment = deployment.to_i
    self.player_id = player_id == nil ? nil : player_id.to_i
  end

  def save
    REDIS.multi do
      REDIS.hset(self.id, "player_id", self.player_id)
      REDIS.hset(self.id, "map_land_id", self.map_land_id)
      REDIS.hset(self.id, "deployment", self.deployment)
    end
  end

  def as_json(options={})
    { :deployment => self.deployment,
      :land_id => self.map_land_id,
      :player_id => self.player_id
    }
  end

  # helper method to generate redis id
  def id
    "game:#{self.game_id}:land:#{self.map_land_id}"
  end

end