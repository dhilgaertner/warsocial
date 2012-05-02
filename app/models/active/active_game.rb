class ActiveGame

  def initialize(name, state, max_player_count, wager_level, map_name, map_json, connections=nil)
    @name = name
    @state = state
    @max_player_count = max_player_count.to_i
    @wager_level = wager_level.to_i
    @map_name = map_name
    @map_json = map_json
  end

  def self.create(name, state, max_player_count, wager_level, map_name, map_json, connections=nil)
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

  def lands
    if @lands == nil
      @lands = Hash.new
    end
    @lands
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

  def connections
    @connections
  end

  def connections=(connections)
    REDIS.hset(self.id, "connections", connections)
    @connections = connections
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

      game = ActiveGame.create(name, Game::WAITING_STATE, num_players, wager, map.name, map.json)
    end

    return game
  end

  # Loads game from REDIS; return NIL if none found
  def self.load_active_game(name)
    game_data = REDIS.multi do
      REDIS.hgetall("game:#{name}")
      REDIS.keys("game:#{name}:player:*")
      REDIS.keys("game:#{name}:land:*")
    end

    if game_data[0].empty?
      return nil
    end

    gh = ActiveGame.array_to_hash(game_data[0])
    game = ActiveGame.new(gh["name"],
                          gh["state"],
                          gh["max_player_count"],
                          gh["wager_level"],
                          gh["map_name"],
                          gh["map_json"],
                          gh["connections"])

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
      player = ActivePlayer.new(name,
                                ph["seat_number"],
                                ph["state"],
                                ph["user_id"],
                                ph["username"],
                                ph["current_points"],
                                ph["is_turn"])
      game.players[player.user_id] = player
    end

    land_data.each do |ld|
      lh = ActiveGame.array_to_hash(ld)
      land = ActiveLand.new(name,
                            ph["map_land_id"],
                            ph["deployment"])
      game.lands[land.map_land_id] = land
    end

    return game
  end

  # Is the user in the game?
  def is_user_in_game?(user)
    self.players.has_key?(user.id)
  end

  # Is it the user's turn?
  def is_users_turn?(user)
    if (self.players.has_key?(user.id))
      return self.players[user.id].is_turn
    else
      return false
    end
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

      self.players[user.id] = new_player

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
      player_to_delete = self.players[user.id]

      if (player_to_delete != nil)
        player_to_delete.delete
        self.players.delete(user.id)

        broadcast(self.name, GameMsgType::STAND, player_to_delete.as_json)

        user.current_points = user.current_points + self.wager_level
        user.save
      end
    end
  end

  # Start Game
  private
  def start_game

    lands = self.get_lands
    land_ids = lands.keys
    lands_each = (lands.length / self.players.values.size).to_i
    random_picks = Array.new

    #Randomly distribute the land amongst the players
    self.players.values.each do |player|
      lands_each.times do |i|
        random_picks.push(player)
      end
    end

    random_picks = random_picks.shuffle
    land_ids = land_ids.shuffle

    land_ids.each do |id|
      player = random_picks.pop

      land = ActiveLand.create(:game_id => self.id,
                               :map_land_id => id,
                               :deployment => 1,
                               :player_id => player.user_id)

      self.lands[id] = land
      #TODO: player.lands and land.player
      #player.lands[id] = land
    end

    #Randomly distribute the armies amongst the player's lands
    self.players.values.each do |player|
      dice = player.lands.size * 2

      results = Array.new(player.lands.size, 0)

      dice.times do |i|
        index = rand_with_range(0..(player.lands.size-1))
        results[index] = results[index] + 1
      end

      results.each_with_index do |result, index|
        land_id = player.lands.to_a[index].id
        land = LandState[land_id]

        total = land.deployment.to_i + result
        land.deployment = total
        land.save
      end
    end

    self.state = Game::STARTED_STATE # We don't save this because 'restart_turn_timer' will save for us'
    restart_turn_timer  # self.save happens here

    player = self.players.to_a.sample
    next_player = PlayerState[player.id]
    next_player.is_turn = true
    next_player.save

    update_delta_points

    data = { :who_am_i => 0,
             :map_layout => ActiveSupport::JSON.decode(self.map.json),
             :players => self.players,
             :deployment => self.lands }

    broadcast(self.name, GameMsgType::START, data)

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

  private
  def get_lands
    if (self.connections == nil)
      map_layout = ActiveSupport::JSON.decode(self.map_json)

      width = map_layout["width"]
      height = map_layout["height"]
      tiles = map_layout["land_id_tiles"]

      lands = Hash.new

      tiles.each_with_index do |tile, index|
        if (tile != 0)
          if (lands[tile] == nil)
            lands[tile] = Array.new
          end
        end
      end

      for row in 0..(height-1)
        for col in 0..(width-1)
          t_index = row * width + col   # the current tile index; very important
          if (tiles[t_index] == 0)
            next
          end   # continue if this tile is an empty land
          if ((col%2 == 1) && (row == height-1))
            next
          end

          right_tile_index = nil
          if (col != width-1)  #If this tile is the last one of the column, no comparison with the right
            right_tile_index = (col%2 == 0) ? t_index + 1 : t_index + 1 + width   #Right tile is one line further for even id tiles
          end

          left_tile_index = nil
          if (col != 0)   # If this tile is the first one of the column, no comparison with the left
            left_tile_index = (col%2 == 0) ? t_index - 1 : t_index - 1 + width    # Left tile is one line further for even id tiles
          end

          bottom_tile_index = nil
          if (row != height-1)   # If this tile is in the last row of the map, no comparison with bottom line
            bottom_tile_index = t_index + width
          end

          # now compare with left tile if exists
          if (left_tile_index != nil && tiles[t_index] != tiles[left_tile_index] && tiles[left_tile_index] != 0)
            if (!lands[tiles[t_index]].include?(tiles[left_tile_index]))
              lands[tiles[t_index]].push(tiles[left_tile_index])
            end
            if (!lands[tiles[left_tile_index]].include?(tiles[t_index]))
              lands[tiles[left_tile_index]].push(tiles[t_index])
            end
          end

          # with right tile if exists
          if (right_tile_index != nil && tiles[t_index] != tiles[right_tile_index] && tiles[right_tile_index] != 0)
            if (!lands[tiles[t_index]].include?(tiles[right_tile_index]))
              lands[tiles[t_index]].push(tiles[right_tile_index])
            end
            if (!lands[tiles[right_tile_index]].include?(tiles[t_index]))
              lands[tiles[right_tile_index]].push(tiles[t_index])
            end
          end

          # with bottom tile if exists
          if (bottom_tile_index != nil && tiles[t_index] != tiles[bottom_tile_index] && tiles[bottom_tile_index] != 0)
            if (!lands[tiles[t_index]].include?(tiles[bottom_tile_index]))
              lands[tiles[t_index]].push(tiles[bottom_tile_index])
            end
            if (!lands[tiles[bottom_tile_index]].include?(tiles[t_index]))
              lands[tiles[bottom_tile_index]].push(tiles[t_index])
            end
          end
        end
      end

      self.connections = ActiveSupport::JSON.encode(lands)
    end

    lands_decoded = ActiveSupport::JSON.decode(self.connections)

    return lands_decoded
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