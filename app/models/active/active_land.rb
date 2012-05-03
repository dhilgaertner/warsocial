class ActiveLand
  def initialize(game_id, map_land_id, deployment, player_id=nil)
    @game_id = game_id
    @map_land_id = map_land_id.to_i
    @deployment = deployment.to_i
    @player_id = player_id == nil ? nil : player_id.to_i
  end

  def save
    REDIS.multi do
      self.map_land_id = self.map_land_id
      self.deployment = self.deployment
      self.player_id = self.player_id == nil ? nil : player_id.to_i
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

  def game_id
    @game_id
  end

  def player_id
    @player_id
  end

  def player_id=(player_id)
    @player_id = player_id
    REDIS.hset(self.id, "player_id", player_id)
  end

  def map_land_id
    @map_land_id
  end

  def map_land_id=(map_land_id)
    @map_land_id = map_land_id
    REDIS.hset(self.id, "map_land_id", map_land_id)
  end

  def deployment
    @deployment
  end

  def deployment=(deployment)
    REDIS.hset(self.id, "deployment", deployment)
    @deployment = deployment
  end

  def player
    @player
  end

  def player=(player)
    REDIS.hset(self.id, "player", player.id)
    @player = player
  end
end