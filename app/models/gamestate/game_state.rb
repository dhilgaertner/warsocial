require 'game_rule'
require 'map'
require 'game'
require 'turn_job'
require 'player'
require 'user'

class GameState < Ohm::Model
  attribute :name
  attribute :state
  attribute :turn_timer_id
  attribute :max_player_count
  attribute :wager_level

  reference :map, MapState
  collection :players, PlayerState
  collection :lands, LandState

  index :name
  index :state

  def validate
    assert_present :name
    assert_present :state
  end

  def as_json(options={})
    { :name => self.name,
      :state => self.state,
      :players => self.players.as_json,
      :max_players => self.max_player_count.to_i,
      :map => self.map.name
    }
  end

  # Find running game by name or create a new one
  def self.get_game_state(name)
    games = GameState.find(:name => name).except(:state => Game::FINISHED_STATE)

    if games.size == 0
      settings = GameRule.where("game_name = ?", name).first

      map_name = (settings == nil) ? "default" : settings.map_name
      num_players = (settings == nil) ? 2 : settings.player_count
      wager = (settings == nil) ? 0 : settings.wager_level

      map = Map.where("name = ?", map_name).first

      game_state = GameState.create(:name => name,
                                    :map => MapState.create(:name => map.name, :json => map.json),
                                    :state => Game::WAITING_STATE,
                                    :max_player_count => num_players,
                                    :wager_level => wager)

      return game_state
    else
      return games.first
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
    GameState.all.except(:state => Game::FINISHED_STATE).as_json
  end

  # Is the user in the game?
  def is_user_in_game?(user)
    self.players.each do |player|
      if (user.id.to_s == player.user_id)
        return true
      end
    end
    return false
  end

  # Is it the user's turn?
  def is_users_turn?(user)
    self.players.each do |player|
      if (user.id.to_s == player.user_id)
        if (player.is_turn == "true")
          return true
        end
      end
    end
    return false
  end

  # Attack
  def attack(attacking_land_id, defending_land_id)
    logger = User.logger

    start_time = Time.now

    elapsed = Time.now - start_time

    logger.info "[#{elapsed * 1000}] start"

    lands = self.map.get_lands

    elapsed = (Time.now - start_time) - elapsed
    logger.info "[#{elapsed * 1000}] 1"
    if (lands[attacking_land_id.to_s].include?(defending_land_id))

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 2"

      atk_land = LandState.find(:game_state_id => self.id, :map_land_id => attacking_land_id).first
      def_land = LandState.find(:game_state_id => self.id, :map_land_id => defending_land_id).first

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 3"

      attack_user_id = atk_land.player_state != nil ? atk_land.player_state.id : nil
      defend_user_id = def_land.player_state != nil ? def_land.player_state.id : nil

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 4"

      if (attack_user_id == defend_user_id || atk_land.deployment.to_i == 1)
        elapsed = (Time.now - start_time) - elapsed
        logger.info "[#{elapsed * 1000}] end"
        return
      end

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 5"

      attack_results = roll(atk_land.deployment)
      defend_results = roll(def_land.deployment)

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 6"

      attack_sum = attack_results.inject{|sum,x| sum + x }
      defend_sum = defend_results.inject{|sum,x| sum + x }

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 7"

      winner = attack_sum > defend_sum ? atk_land : def_land
      loser = attack_sum > defend_sum ? def_land : atk_land

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 8"

      if (atk_land == winner)
        loser_player = loser.player_state

        elapsed = (Time.now - start_time) - elapsed
        logger.info "[#{elapsed * 1000}] 9"

        loser.deployment = winner.deployment.to_i - 1
        loser.player_state = winner.player_state
        loser.save

        elapsed = (Time.now - start_time) - elapsed
        logger.info "[#{elapsed * 1000}] 10"

        winner.deployment = 1
        winner.save

        elapsed = (Time.now - start_time) - elapsed
        logger.info "[#{elapsed * 1000}] 11"

        if (loser_player != nil)
          if (loser_player.lands.size == 0)
            loser_player.state = Player::DEAD_PLAYER_STATE
            loser_player.save

            elapsed = (Time.now - start_time) - elapsed
            logger.info "[#{elapsed * 1000}] 12"

            players_left = PlayerState.find(:game_state_id => self.id).except(:state => Player::DEAD_PLAYER_STATE)

            elapsed = (Time.now - start_time) - elapsed
            logger.info "[#{elapsed * 1000}] 13"

            cash_player_out(players_left.size + 1, loser_player)

            elapsed = (Time.now - start_time) - elapsed
            logger.info "[#{elapsed * 1000}] 14"

            check_for_winner

            elapsed = (Time.now - start_time) - elapsed
            logger.info "[#{elapsed * 1000}] 15"

          end
        end
      else
        loser.deployment = 1
        loser.save
      end

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 16"

      restart_turn_timer

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 17"

      update_delta_points

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 18"

      data = { :players => self.players,
               :attack_info => { :attacker_land_id => attacking_land_id,
                                 :attacker_roll => attack_results,
                                 :attacker_player_id => atk_land.player_state.user_id,
                                 :defender_land_id => defending_land_id,
                                 :defender_roll => defend_results,
                                 :defender_player_id => def_land.player_state.user_id
                                },
               :deployment_changes => [atk_land, def_land]
             }

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 19"

      broadcast(self.name, GameMsgType::ATTACK, data)

      elapsed = (Time.now - start_time) - elapsed
      logger.info "[#{elapsed * 1000}] 20"

    end
  end

  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1

      new_player = PlayerState.create(:game_state_id => self.id,
                                      :username => user.username,
                                      :user_id => user.id,
                                      :seat_number => seat,
                                      :is_turn => false,
                                      :current_points => user.current_points)

      broadcast(self.name, GameMsgType::SIT, new_player.as_json)

      user.current_points = user.current_points.to_i - self.wager_level.to_i
      user.save

      if self.players.size == self.max_player_count.to_i
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
        if (player.user_id == user.id.to_s)
          player_to_delete = player
        end
      end

      if (player_to_delete != nil)
        player_to_delete.delete
        broadcast(self.name, GameMsgType::STAND, player_to_delete.as_json)

        user.current_points = user.current_points.to_i + self.wager_level
        user.save
      end
    end
  end

  # Player flags
  # @param user [User]
  def flag_player(user)
    if self.state == Game::STARTED_STATE
      player = PlayerState.find(:game_state_id => self.id, :user_id => user.id).first

      if (player != nil)

        if (self.is_users_turn?(user))
          end_turn
        end

        player.state = Player::DEAD_PLAYER_STATE
        player.save

        player.lands.each do |land|
          land.player_state = nil
          land.save
        end

        broadcast(self.name, GameMsgType::QUIT, player)

        players_left = PlayerState.find(:game_state_id => self.id).except(:state => Player::DEAD_PLAYER_STATE)

        cash_player_out(players_left.size + 1, player)

        check_for_winner
      end

      return player
    else
      return nil
    end
  end

  # End the current players turn
  def end_turn
    cp = current_player
    np = next_player

    reenforce(cp, how_many_reenforcements(cp))

    cp.is_turn = false
    np.is_turn = true

    cp.save
    np.save

    restart_turn_timer

    broadcast(self.name, GameMsgType::TURN, {:player_id => np.user_id, :name => np.username})
  end

  # Force the end of the current players turn
  def force_end_turn
    end_turn
  end

  # Delete All
  def delete_all
    if self.map != nil
      self.map.delete
    end

    if self.players.size != 0
      self.players.each do |player|
        player.delete
      end
    end

    if self.lands.size != 0
      self.lands.each do |land|
        land.delete
      end
    end

    kill_turn_timer

    self.delete
  end

  private
  def cash_player_out(position, player)
    user = User.find(player.user_id.to_i)
    user.current_points = user.current_points.to_i + GameRule.calc_delta_points(position, self.wager_level.to_i, self.max_player_count.to_i)
    user.save
    player.current_points = user.current_points
    player.save
  end

  # Start Game
  private
  def start_game

    lands = self.map.get_lands
    land_ids = lands.keys
    lands_each = (lands.length / self.players.size).to_i
    random_picks = Array.new

    #Randomly distribute the land amongst the players
    self.players.each do |player|
      lands_each.times do |i|
        random_picks.push(player)
      end
    end

    random_picks = random_picks.shuffle
    land_ids = land_ids.shuffle

    land_ids.each do |id|
      player = random_picks.pop
      land = LandState.create(:game_state_id => self.id, :player_state => player, :deployment => 1, :map_land_id => id)
      self.lands << land

    end

    #Randomly distribute the armies amongst the player's lands
    self.players.each do |player|
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
  def update_delta_points
    players = self.players.to_a

    players.sort! { |a,b| b.lands.size <=> a.lands.size }

    players.each_index { |index|
      players[index].current_place = index + 1
      players[index].current_delta_points = GameRule.calc_delta_points(index + 1, self.wager_level.to_i, self.max_player_count.to_i)
      players[index].save
    }
  end

  # Find which player is currently having a turn
  private
  def current_player
    PlayerState.find(:game_state_id => self.id, :is_turn => "true").first
  end

  # Find which player is next in line turn-wise
  private
  def next_player
    sorted_players = PlayerState.find(:game_state_id => self.id).except(:state => Player::DEAD_PLAYER_STATE).sort_by(:seat_number, :order => "ASC")

    i = sorted_players.index(current_player)

    index = 0
    if (i != (sorted_players.size - 1))
      index = i+1
    end

    sorted_players[index]
  end

  # Check whether or not the game is over
  private
  def check_for_winner
    players_left = PlayerState.find(:game_state_id => self.id).except(:state => Player::DEAD_PLAYER_STATE)

    if (players_left.size == 1)
      winner = players_left.first

      self.state = Game::FINISHED_STATE
      self.save

      kill_turn_timer

      broadcast(self.name, GameMsgType::WINNER, winner.as_json)

      cash_player_out(1, winner)

      return winner
    end
  end

  # Check whether or not the land is owned by the player
  private
  def how_many_reenforcements(player)
    connects = self.map.get_lands

    own_land_ids = Array.new

    player.lands.each { |land| own_land_ids.push(land.map_land_id.to_i) }

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
      candidates = lands.select{|x| x.deployment.to_i < 8}

      if (!candidates.empty?)
        land = rand_with_range(candidates)
        land.deployment = land.deployment.to_i + 1
        land.save

        changed.push(land)
      end
    end

    changed.reverse!  #reverse so that the latest deployments are kept in case of duplicates

    broadcast(self.name, GameMsgType::DEPLOY, changed.uniq)
  end

  private
  def restart_turn_timer
    kill_turn_timer

    new_job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 20.seconds.from_now)
    self.turn_timer_id = new_job.id
    self.save
  end

  private
  def kill_turn_timer
    if (self.turn_timer_id != nil)
      old_job = Delayed::Job.find(self.turn_timer_id)
      if old_job != nil
        old_job.destroy
        self.turn_timer_id = nil
        self.save
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
end
