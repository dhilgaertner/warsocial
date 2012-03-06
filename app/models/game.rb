class Game < ActiveRecord::Base
  belongs_to :map
  has_many :players, :dependent => :destroy
  has_many :game_logs, :dependent => :destroy
  has_many :lands, :dependent => :destroy
  has_many :users, :through => :players

  require 'constants/message_type'
  
  # Game States: Default for Migration
  WAITING_STATE = "waiting for players"
  STARTED_STATE = "game started"
  FINISHED_STATE = "game finished"
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :name, :state, :turn_timer_id
  
  # Find running game by name or create a new one
  def self.get_game(name, map_name = nil)
    games = Game.where("name = ? AND state != ?", name, Game::FINISHED_STATE)
    
    if (map_name == nil)
      settings = GameRule.where("game_name = ?", name).first
      
      if (settings == nil)
        map_name = "default"
      else
        map_name = settings.map_name
      end 
    end 
    
    if games.size == 0 
      return Map.where("name = ?", map_name).first.games.create(:name => name)
    else
      return games.first
    end
  end
  
  # Is the user in the game?
  def is_user_in_game?(user)
    if (self.users.exists?(user))
      return true
    else
      return false
    end
  end
  
  # Is it the user's turn?
  def is_users_turn?(user)
    player = Player.where("game_id = ? AND user_id = ?", self.id, user.id)
    
    if (player.size > 0)
      return player.first.is_turn 
    else
      return false
    end
  end
  
  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1
      new_player = self.players.create(:user => user, :seat_number => seat, :is_turn => false)
      
      broadcast(self.name, GameMsgType::SIT, new_player)
      
      rules = GameRule.where("game_name = ?", self.name).first

      if (rules == nil)
        max_players = 2
      else
        max_players = rules.player_count
      end 
      
      if self.players.size == max_players
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
      player = user.players.where("game_id = ?", self.id).first
      
      if (player != nil)
        #noinspection RubyArgCount
        Player.destroy(player.id)
        broadcast(self.name, GameMsgType::STAND, player)
      end 
      
      return player
    else 
      return nil
    end
  end
  
  # Player flags
  # @param user [User]
  def flag_player(user)
    if self.state == Game::STARTED_STATE
      player = user.players.where("game_id = ?", self.id).first
      
      if (player != nil)
        
        if (is_user_turn?(user))
          end_turn
        end 
        
        player.state = Player::DEAD_PLAYER_STATE
        player.lands.clear
        player.save
        
        broadcast(self.name, GameMsgType::QUIT, player)
        
        check_for_winner
      end 
      
      return player
    else 
      return nil
    end
  end
  
  # Attack
  def attack(attacking_land_id, defending_land_id)
    lands = self.map.get_lands
    
    if (lands[attacking_land_id].include?(defending_land_id))
      
      atk_land = Land.where("game_id = ? AND map_land_id = ?", self.id, attacking_land_id).first
      def_land = Land.where("game_id = ? AND map_land_id = ?", self.id, defending_land_id).first
      
      if (atk_land.player == def_land.player || atk_land.deployment == 1)
        return
      end 
      
      attack_results = roll(atk_land.deployment)
      defend_results = roll(def_land.deployment)
      
      attack_sum = attack_results.inject{|sum,x| sum + x }
      defend_sum = defend_results.inject{|sum,x| sum + x }
      
      winner = attack_sum > defend_sum ? atk_land : def_land
      loser = attack_sum > defend_sum ? def_land : atk_land
      
      if (atk_land == winner)
        loser_player = loser.player
        
        loser.deployment = winner.deployment - 1
        loser.player = winner.player
        loser.save
        
        winner.deployment = 1
        winner.save
        
        if (loser_player != nil)
          if (loser_player.lands.size == 0)
            loser_player.state = Player::DEAD_PLAYER_STATE
            loser_player.save
          
            check_for_winner
          end
        end
      else 
        loser.deployment = 1
        loser.save
      end

      restart_turn_timer

      data = { :attack_info => { :attacker_land_id => attacking_land_id, 
                                 :attacker_roll => attack_results,
                                 :attacker_player_id => atk_land.player.user.id,
                                 :defender_land_id => defending_land_id,
                                 :defender_roll => defend_results,
                                 :defender_player_id => def_land.player.user.id
                               },
               :deployment_changes => [atk_land, def_land]
             }
      
      broadcast(self.name, GameMsgType::ATTACK, data)
      
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

    broadcast(self.name, GameMsgType::TURN, {:player_id => np.user.id, :name => np.user.username})
  end
  
  # Force the end of the current players turn
  def force_end_turn
    end_turn
  end
  
  # Check whether or not it is the user's turn
  def is_user_turn?(user)
    player = self.players.where("user_id = ? AND is_turn = ?", user.id, true)
    
    player.size > 0
  end
  
  # Start Game
  private
  def start_game
    
    lands = self.map.get_lands
    land_ids = lands.keys
    lands_each = (lands.length / self.players.length).to_i
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
      land = self.lands.create(:player => player, :deployment => 1, :map_land_id => id)
      
      if (player != nil)
        player.lands << land
      end
    end
    
    #Randomly distribute the armies amongst the player's lands
    self.players.each do |player|
      dice = player.lands.size * 2
      
      results = Array.new(player.lands.size, 0)
      
      dice.times do |i|
        index = rand_with_range(0..(player.lands.size-1))
        results[index] = results[index] + 1
      end
      
      Land.transaction do
        results.each_with_index do |result, index|
          player.lands[index].deployment += result 
          player.lands[index].save
        end
      end
    end

    self.state = Game::STARTED_STATE # We don't save this because 'restart_turn_timer' will save for us'
    restart_turn_timer  # self.save happens here

    player = self.players.sample
    player.is_turn = true
    player.save

    data = { :who_am_i => 0,
             :map_layout => ActiveSupport::JSON.decode(self.map.json),
             :players => self.players,
             :deployment => self.lands }
    
    broadcast(self.name, GameMsgType::START, data)

  end
  
  # Find which player is currently having a turn
  private
  def current_player
    self.players.where("is_turn = ?", true).first
  end
  
  # Find which player is next in line turn-wise
  private
  def next_player
    sorted_players = self.players.where('state != ?', Player::DEAD_PLAYER_STATE).sort { |a,b| a.seat_number <=> b.seat_number }

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
    players_left = self.players.where('state != ?', Player::DEAD_PLAYER_STATE)
    
    if (players_left.size == 1)
      winner = players_left.first
      
      self.state = Game::FINISHED_STATE
      self.save

      kill_turn_timer

      broadcast(self.name, GameMsgType::WINNER, winner)
      
      return winner
    end 
  end
  
  # Check whether or not the land is owned by the player
  private
  def how_many_reenforcements(player)
    connects = self.map.get_lands
    
    own_land_ids = Array.new
    
    player.lands.each { |land| own_land_ids.push(land.map_land_id) }
    
    not_connected = own_land_ids.select { |id| (connects[id] & own_land_ids).size == 0 }
    
    connected = own_land_ids - not_connected  
    
    islands = Array.new
    
    connected.each { |id| 
      segment = [ id ].concat(connects[id].uniq & connected)
      
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
      candidates = lands.select{|x| x.deployment < 8}
      
      if (!candidates.empty?)
        land = rand_with_range(candidates)
        land.deployment += 1
    
        changed.push(land)
      end
    end
    
    Land.transaction do
      changed.uniq.each { |land| 
        land.save
      }
    end
    
    broadcast(self.name, GameMsgType::DEPLOY, changed)
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
    num_dice.times.map{ rand_with_range(1..6) } 
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
