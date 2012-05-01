class ActiveGame

  def initialize(name, state, max_player_count, wager_level, map_name, map_json)
    @name = name
    @state = state
    @max_player_count = max_player_count.to_i
    @wager_level = wager_level.to_i
    @map_name = map_name
    @map_json = map_json
  end

  def self.create(name, state, max_player_count, wager_level, map_name, map_json)
    new_game = ActiveGame.new(name, state, max_player_count, wager_level, map_name, map_json)

    REDIS.multi do
      new_game.name = name
      new_game.state = state
      new_game.max_player_count = max_player_count.to_i
      new_game.wager_level = wager_level.to_i
      new_game.map_name = map_name
      new_game.map_json = map_json
    end

    return new_game
  end

  # helper method to generate redis id
  def id
    "game:#{self.name}"
  end

  def players
    if @players == nil
      @players = Hash.new
    end
    @players
  end

  def name
    @name
  end

  def name=(name)
    @name = name
    REDIS.hset(self.id, "name", name)
  end

  def state
    @state
  end

  def state=(state)
    REDIS.hset(self.id, "state", state)
    @state = state
  end

  def turn_timer_id
    @turn_timer_id
  end

  def turn_timer_id=(turn_timer_id)
    REDIS.hset(self.id, "turn_timer_id", turn_timer_id)
    @turn_timer_id = turn_timer_id
  end

  def max_player_count
    @max_player_count
  end

  def max_player_count=(max_player_count)
    REDIS.hset(self.id, "max_player_count", max_player_count)
    @max_player_count = max_player_count
  end

  def wager_level
    @wager_level
  end

  def wager_level=(wager_level)
    REDIS.hset(self.id, "wager_level", wager_level)
    @wager_level = wager_level
  end

  def map_name
    @map_name
  end

  def map_name=(map_name)
    REDIS.hset(self.id, "map_name", map_name)
    @map_name = map_name
  end

  def map_json
    @map_json
  end

  def map_json=(map_json)
    REDIS.hset(self.id, "map_json", map_json)
    @map_json = map_json
  end

  def as_json(options={})
    { :name => self.name,
      :state => self.state,
      :players => [], # self.players.as_json,
      :max_players => self.max_player_count,
      :map => self.map_name
    }
  end

  # Find running game by name or create a new one
  def self.get_active_game(name)

    game = ActiveGame.load_active_game(name)

    if game == nil
      settings = GameRule.where("game_name = ?", name).first

      map_name = (settings == nil) ? "default" : settings.map_name
      num_players = (settings == nil) ? 2 : settings.player_count
      wager = (settings == nil) ? 0 : settings.wager_level

      map = Map.where("name = ?", map_name).first

      game = ActiveGame.new(:name => name,
                            :map_name => map.name,
                            :map_json => map.json,
                            :state => Game::WAITING_STATE,
                            :max_player_count => num_players,
                            :wager_level => wager)
    end

    return game
  end

  # Loads game from REDIS; return NIL if none found
  private
  def self.load_active_game(name)
    game_data = REDIS.multi do
      REDIS.hgetall("game:#{name}")
      REDIS.keys("game:#{name}:player:*")
      REDIS.keys("game:#{name}:land:*")
    end

    if game_data[0] == nil
      return nil
    end

    gh = ActiveGame.array_to_hash(game_data[0])
    game = ActiveGame.new(gh["name"], gh["state"], gh["max_player_count"], gh["wager_level"], gh["map_name"], gh["map_json"])

    player_and_land_data = REDIS.multi do
      game_data[1].each do |key|
        REDIS.hgetall(key)
      end
      game_data[2].each do |key|
        REDIS.hgetall(key)
      end
    end

    player_data = player_and_land_data[0, game_data[1].size]
    land_data = player_and_land_data[-1 * game_data[2].size, game_data[2].size]

    player_data.each do |pd|
      ph = ActiveGame.array_to_hash(pd)
      player = ActivePlayer.new(name, ph["seat_number"], ph["state"], ph["user_id"], ph["username"], ph["current_points"], ph["is_turn"])
      game.players[player.user_id] = player
    end

    land_data.each do |ld|
      lh = ActiveGame.array_to_hash(ld)
      land = ActiveLand.new(name, ph["map_land_id"], ph["deployment"])
      game.lands[land.map_land_id] = land
    end

    return game
  end

  # Is the user in the game?
  def is_user_in_game?(user)
    self.players.each do |player|
      if (user.id == player.user_id)
        return true
      end
    end
    return false
  end

  # Is it the user's turn?
  def is_users_turn?(user)
    self.players.each do |player|
      if (user.id == player.user_id)
        if (player.is_turn)
          return true
        end
      end
    end
    return false
  end

  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1

      new_player = ActivePlayer.create(self.name,
                                       seat,
                                       Player::DEFAULT_PLAYER_STATE,
                                       user.id,
                                       user.username,
                                       user.current_points)

      self.players[user_id] = player

      broadcast(self.name, GameMsgType::SIT, new_player.as_json)

      user.current_points = user.current_points - self.wager_level
      user.save

      if self.players.size == self.max_player_count
        start_game
      end

      return new_player
    else
      return nil
    end
  end

  # Remove player at game table.
  def remove_player(user)
    if self.state == Game::WAITING_STATE
      player_to_delete = nil
      self.players.each do |player|
        if (player.user_id == user.id)
          player_to_delete = player
        end
      end

      if (player_to_delete != nil)
        player_to_delete.delete
        self.players.delete(player_to_delete.user_id)

        broadcast(self.name, GameMsgType::STAND, player_to_delete.as_json)

        user.current_points = user.current_points + self.wager_level
        user.save
      end
    end
  end

  private
  def broadcast(room, type, message)
    Pusher["presence-" + room].trigger(type, message)
  end

  # Get random roll results
  private
  def roll(num_dice)
    num_dice.to_i.times.map{ rand_with_range(1..6) }
  end

  private
  def rand_with_range(values = nil)
    if values.respond_to? :sort_by
      result = values.sort_by { rand }.first
    else
      rand(values)
    end
  end

  def self.array_to_hash(arr)
    current_key = nil
    hash = Hash.new

    arr.each_with_index do |item, index|
      is_key = (index % 2) == 0

      if is_key
        current_key = item
      else
        hash[current_key] = item
      end
    end

    return hash
  end
end