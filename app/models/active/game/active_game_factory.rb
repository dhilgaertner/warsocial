class ActiveGameFactory < ActiveGameBase
  # Find running game by name or create a new one
  def self.get_active_game(name)

    game = ActiveGameFactory.load_active_game_from_redis(name)

    if game == nil
      settings = GameRule.where("game_name = ?", name).first

      ActiveGameFactory.create_new_game(settings)

      REDIS.multi do
        game.save
      end
    end

    return game
  end

  def self.create_new_game(settings)
    map_name = (settings == nil) ? "default" : settings.map_name
    num_players = (settings == nil) ? 2 : settings.player_count
    wager = (settings == nil) ? 0 : settings.wager_level

    map = Map.where("name = ?", map_name).first

    game = ActiveGame.new(name, Game::WAITING_STATE, num_players, wager, map.name, map.json)
  end

  # Loads game from REDIS; return NIL if none found
  def self.load_active_game_from_redis(name)
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
                          gh["connections"],
                          gh["turn_timer_id"],
                          gh["turn_count"])

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
                                ph["is_turn"],
                                ph["current_delta_points"],
                                ph["current_place"],
                                ph["reserves"],
                                ph["missed_turns"])

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
end