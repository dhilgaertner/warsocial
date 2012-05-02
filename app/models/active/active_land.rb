class ActiveLand
  def initialize(game_id, map_land_id, deployment, player_id=nil)
    @game_id = game_id
    @map_land_id = map_land_id.to_i
    @deployment = deployment.to_i
    @player_id = player_id == nil ? nil : player_id.to_i
  end

  def self.create(game_id, map_land_id, deployment, player_id=nil)
    new_land = ActiveLand.new(game_id, map_land_id, deployment, player_id)

    REDIS.multi do
      new_land.map_land_id = map_land_id
      new_land.deployment = deployment
      new_land.player_id = player_id == nil ? nil : player_id.to_i
    end

    return new_land
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