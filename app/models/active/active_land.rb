class ActiveLand
  def initialize(game_id, map_land_id, deployment)
    @game_id = game_id
    @map_land_id = map_land_id
    @deployment = deployment
  end

  def self.create(game_id, map_land_id, deployment)
    new_land = ActiveLand.new(game_id, map_land_id, deployment)

    REDIS.multi do
      new_land.map_land_id = map_land_id
      new_land.deployment = deployment
    end

    return new_land
  end

  def as_json(options={})
    { :deployment => self.deployment,
      :land_id => self.map_land_id,
      :player_id => self.player != nil ? self.player.user_id : nil
    }
  end

  # helper method to generate redis id
  def id
    "game:#{self.game_id}:land:#{self.map_land_id}"
  end

  def game_id
    @game_id
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