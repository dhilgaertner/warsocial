class ActiveGame

  attr_accessor :name, :state, :turn_timer_id, :max_player_count, :wager_level, :map_name, :map_json, :connections

  def initialize(name, state, max_player_count, wager_level, map_name, map_json, connections=nil)
    self.name = name
    self.state = state
    self.max_player_count = max_player_count.to_i
    self.wager_level = wager_level.to_i
    self.map_name = map_name
    self.map_json = map_json
  end

  def save
    REDIS.hset(self.id, "name", self.name)
    REDIS.hset(self.id, "state", self.state)
    REDIS.hset(self.id, "turn_timer_id", self.turn_timer_id)
    REDIS.hset(self.id, "max_player_count", self.max_player_count)
    REDIS.hset(self.id, "wager_level", self.wager_level)
    REDIS.hset(self.id, "map_name", self.map_name)
    REDIS.hset(self.id, "map_json", self.map_json)
    REDIS.hset(self.id, "connections", self.connections)
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

  def as_json(options={})
    { :name => self.name,
      :state => self.state,
      :players => self.players.as_json,
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

      game = ActiveGame.new(name, Game::WAITING_STATE, num_players, wager, map.name, map.json)

      REDIS.multi do
        game.save
      end
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
                            lh["map_land_id"],
                            lh["deployment"],
                            lh["player_id"])
      if land.player_id != nil
        game.players[land.player_id].lands[land.map_land_id] = land
      end
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

  def create_game
    if (current_user != nil)
      map_name = Map.find_all_by_name(params[:select_map]).empty? ? "default" : params[:select_map]
      number_of_players = [2,3,4,5,6,7].include?(params[:select_players].to_i) ? params[:select_players].to_i : 2
      wager = params[:select_wager].to_i >= 0 ? params[:select_wager].to_i : 0
      game_name = nil

      try_name = current_user.username
      try = 1

      while game_name == nil
        gr = GameRule.find_by_game_name(try_name)

        if (gr == nil)
          game_name = try_name
          GameRule.create(:game_name => game_name, :map_name => map_name, :player_count => number_of_players, :wager_level => wager)
        else
          try = try + 1
          try_name = current_user.username + try.to_s
        end
      end

      render :text=>game_name, :status=>200
    else
      render :text=>"Forbidden", :status=>403
    end
  end

  # Find games to be shown in the lobby
  def self.get_lobby_games
    #GameState.all.except(:state => Game::FINISHED_STATE).as_json
  end

  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1

      new_player = ActivePlayer.new(self.name,
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
      else
        REDIS.multi do
          new_player.save # Only need to save here because "start_game" saves all the players and lands
        end
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
        REDIS.multi do
          player_to_delete.delete
        end
        self.players.delete(user.id)

        broadcast(self.name, GameMsgType::STAND, player_to_delete.as_json)

        user.current_points = user.current_points + self.wager_level
        user.save
      end
    end
  end

  # Attack
  def attack(attacking_land_id, defending_land_id)
    logger = User.logger

    start_time = Time.now

    elapsed = Time.now - start_time

    puts "[#{elapsed * 1000}] start"

    lands = get_lands

    elapsed = (Time.now - start_time) - elapsed
    puts "[#{elapsed * 1000}] 1"
    if (lands[attacking_land_id.to_s].include?(defending_land_id))

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 2"

      atk_land = self.lands[attacking_land_id]
      def_land = self.lands[defending_land_id]

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 3"

      attack_user_id = atk_land.player_id
      defend_user_id = def_land.player_id

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 4"

      if (attack_user_id == defend_user_id || atk_land.deployment == 1)
        elapsed = (Time.now - start_time) - elapsed
        puts "[#{elapsed * 1000}] end"
        return
      end

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 5"

      attack_results = roll(atk_land.deployment)
      defend_results = roll(def_land.deployment)

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 6"

      attack_sum = attack_results.inject{|sum,x| sum + x }
      defend_sum = defend_results.inject{|sum,x| sum + x }

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 7"

      winner = attack_sum > defend_sum ? atk_land : def_land
      loser = attack_sum > defend_sum ? def_land : atk_land

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 8"

      if (atk_land == winner)
        loser_player = loser.player_id != nil ? self.players[loser.player_id] : nil
        winner_player = self.players[winner.player_id]

        elapsed = (Time.now - start_time) - elapsed
        puts "[#{elapsed * 1000}] 9"

        loser.deployment = winner.deployment.to_i - 1
        loser.player_id = winner.player_id

        winner_player.lands[loser.map_land_id] = loser
        if loser_player != nil
          loser_player.lands.delete(loser.map_land_id)
        end

        elapsed = (Time.now - start_time) - elapsed
        puts "[#{elapsed * 1000}] 10"

        winner.deployment = 1

        elapsed = (Time.now - start_time) - elapsed
        puts "[#{elapsed * 1000}] 11"

        if (loser_player != nil)
          if (loser_player.lands.size == 0)
            loser_player.state = Player::DEAD_PLAYER_STATE

            elapsed = (Time.now - start_time) - elapsed
            puts "[#{elapsed * 1000}] 12"

            players_left = self.players.values.select {|player| player.state != Player::DEAD_PLAYER_STATE }

            elapsed = (Time.now - start_time) - elapsed
            puts "[#{elapsed * 1000}] 13"

            cash_player_out(players_left.size + 1, loser_player)

            elapsed = (Time.now - start_time) - elapsed
            puts "[#{elapsed * 1000}] 14"

            check_for_winner

            elapsed = (Time.now - start_time) - elapsed
            puts "[#{elapsed * 1000}] 15"

          end
        end
      else
        loser.deployment = 1
      end

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 16"

      restart_turn_timer

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 17"

      update_delta_points

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 18"

      data = { :players => self.players.values,
               :attack_info => { :attacker_land_id => attacking_land_id,
                                 :attacker_roll => attack_results,
                                 :attacker_player_id => atk_land.player_id,
                                 :defender_land_id => defending_land_id,
                                 :defender_roll => defend_results,
                                 :defender_player_id => def_land.player_id
               },
               :deployment_changes => [atk_land, def_land]
      }

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 19"

      broadcast(self.name, GameMsgType::ATTACK, data)

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 20"

      save_all

      elapsed = (Time.now - start_time) - elapsed
      puts "[#{elapsed * 1000}] 21"

    end
  end

  # End the current players turn
  def end_turn
    cp = current_player
    np = next_player

    reenforce(cp, how_many_reenforcements(cp))

    cp.is_turn = false
    np.is_turn = true

    restart_turn_timer

    broadcast(self.name, GameMsgType::TURN, {:player_id => np.user_id, :name => np.username})

    REDIS.multi do
      self.save
      np.save
      cp.save
    end
  end

  # Force the end of the current players turn
  def force_end_turn
    end_turn
  end

  # Delete All
  def delete_all
    REDIS.multi do
      self.players.each do |player|
        player.delete
      end

      self.lands.each do |land|
        land.delete
      end

      kill_turn_timer

      self.delete
    end
  end

  # Start Game
  private
  def start_game

    lands = get_lands
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

      land = ActiveLand.new(self.name, id.to_i, 1, player != nil ? player.user_id : nil)

      self.lands[id.to_i] = land

      if player != nil
        player.lands[id.to_i] = land
      end
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
        land_id = player.lands.values[index].map_land_id
        land = self.lands[land_id]

        total = land.deployment + result
        land.deployment = total
      end
    end

    self.state = Game::STARTED_STATE # We don't save this because 'restart_turn_timer' will save for us'
    restart_turn_timer  # self.save happens here

    next_player = self.players.values.sample
    next_player.is_turn = true

    update_delta_points

    data = { :who_am_i => 0,
             :map_layout => ActiveSupport::JSON.decode(self.map_json),
             :players => self.players.values,
             :deployment => self.lands.values }

    broadcast(self.name, GameMsgType::START, data)

    save_all
  end

  # Player flags
  def flag_player(user)
    if self.state == Game::STARTED_STATE
      player = self.players[user.id]

      if (player != nil)

        if (player.is_turn)
          end_turn
        end

        player.state = Player::DEAD_PLAYER_STATE

        broadcast(self.name, GameMsgType::QUIT, player)

        players_left = self.players.values.select {|player| player.state != Player::DEAD_PLAYER_STATE }

        cash_player_out(players_left.size + 1, player)

        check_for_winner

        save_all
      end

      return player
    else
      return nil
    end
  end

  # Check whether or not the game is over
  private
  def check_for_winner
    players_left = self.players.values.select {|player| player.state != Player::DEAD_PLAYER_STATE }

    if (players_left.size == 1)
      winner = players_left.first

      self.state = Game::FINISHED_STATE

      kill_turn_timer

      broadcast(self.name, GameMsgType::WINNER, winner.as_json)

      cash_player_out(1, winner)

      return winner
    end
  end

  # Check whether or not the land is owned by the player
  private
  def how_many_reenforcements(player)
    connects = get_lands

    own_land_ids = Array.new

    player.lands.values.each { |land| own_land_ids.push(land.map_land_id) }

    not_connected = own_land_ids.select { |id| (connects[id.to_s] & own_land_ids).size == 0 }

    connected = own_land_ids - not_connected

    islands = Array.new

    connected.each { |id|
      segment = [ id ].concat(connects[id.to_s].uniq & connected)

      con_islands = islands.select { |island| (segment & island).size > 0 }

      if (con_islands.size == 0)
        islands.push(segment.uniq)
      else
        con_islands.each { |ci|
          index = islands.index(ci)
          islands[index] = ci.concat(segment).uniq
        }
      end
    }

    final_islands = Array.new

    islands.each { |island|
      con_islands = final_islands.select { |fi| (island & fi).size > 0 }

      if (con_islands.size == 0)
        final_islands.push(island.uniq)
      else
        con_islands.each { |ci|
          index = final_islands.index(ci)
          final_islands[index] = ci.concat(island).uniq
        }
      end
    }

    result = 0

    final_islands.each { |island|
      if (result < island.size)
        result = island.size
      end
    }

    result == 0 ? 1 : result
  end

  # Re-enforce player's lands randomly
  private
  def reenforce(player, num_armies)
    lands = player.lands

    changed = Array.new
    num_armies.times do |x|
      candidates = lands.values.select{|l| l.deployment < 8}

      if (!candidates.empty?)
        land = rand_with_range(candidates)
        land.deployment = land.deployment + 1

        changed.push(land)
      end
    end

    changed.reverse!  #reverse so that the latest deployments are kept in case of duplicates

    broadcast(self.name, GameMsgType::DEPLOY, changed.uniq)
  end

  # Find which player is currently having a turn
  private
  def current_player
    cp = self.players.values.select {|player| player.is_turn == true }
    return cp.first
  end

  # Find which player is next in line turn-wise
  private
  def next_player
    non_dead_players = self.players.values.select {|player| player.state != Player::DEAD_PLAYER_STATE }
    sorted_players = non_dead_players.sort { |a,b| a.seat_number <=> b.seat_number }

    i = sorted_players.index(current_player)

    index = 0
    if (i != (sorted_players.size - 1))
      index = i+1
    end

    return sorted_players[index]
  end

  private
  def update_delta_points
    players = self.players.values
    players.sort! { |a,b| b.lands.size <=> a.lands.size }

    players.each_index { |index|
      players[index].current_place = index + 1
      players[index].current_delta_points = GameRule.calc_delta_points(index + 1, self.wager_level, self.max_player_count)
    }
  end

  private
  def restart_turn_timer
    kill_turn_timer

    new_job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 20.seconds.from_now)
    self.turn_timer_id = new_job.id
  end

  private
  def kill_turn_timer
    if (self.turn_timer_id != nil)
      old_job = Delayed::Job.find(self.turn_timer_id)
      if old_job != nil
        old_job.destroy
        self.turn_timer_id = nil
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
      self.save
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

  private
  def save_all
    REDIS.multi do
      self.save
      self.players.values.each do |player|
        player.save
      end
      self.lands.values.each do |land|
        land.save
      end
    end
  end
end