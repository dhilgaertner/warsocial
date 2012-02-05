class Game < ActiveRecord::Base
  belongs_to :map
  has_many :players, :dependent => :destroy
  has_many :game_logs, :dependent => :destroy
  has_many :lands, :dependent => :destroy
  
  require 'constants/message_type'
  
  # Game States
  WAITING_STATE = "waiting for players"
  STARTED_STATE = "game started"
  FINISHED_STATE = "game finished"
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :name, :state, :turn_timer_id
  
  # Find running game by name or create a new one
  def self.get_game(name)
    games = Game.where("name = ? AND state != ?", name, Game::FINISHED_STATE)
    
    if games.size == 0 
      return Map.first.games.create(:name => name)
    else
      return games.first
    end
  end
  
  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1
      new_player = self.players.create(:user => user, :seat_number => seat, :is_turn => false)
      
      Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "#{seat} player(s) seated.", :name => "Server"})
      
      if self.players.size == 2 
        start_game
      end
      
      return new_player
    else 
      return nil
    end
  end
  
  # Attack
  def attack(user)
    player = self.players.where("user_id = ?", user.id).first
    
    if (player != nil && player.is_turn == true)
      old_job = Delayed::Job.find(self.turn_timer_id)
    
      if old_job != nil
        old_job.destroy
        new_job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 10.seconds.from_now)
        self.turn_timer_id = new_job.id
        self.save
      
        Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "Attack! (turn timer restarted)", :name => "Server"})
      end
    end
  end
  
  # Force the end of the current players turn
  def force_end_turn
    new_player = Player.where("game_id = ? AND is_turn = ?", self.id, true).first
    job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 10.seconds.from_now)
    self.turn_timer_id = job.id
    self.save
    
    Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "Turn Forfeit", :name => "Server"})
    Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "#{new_player.user.username}'s turn has started.", :name => "Server"})
  end
  
  # Start Game
  private
  def start_game
    
    lands = self.map.get_lands
    land_ids = lands.keys
    lands_each = (lands.length / self.players.length).to_i
    random_picks = Array.new
    
    self.players.each do |player|
       lands_each.times do |i|
          random_picks.push(player)
       end
    end
    
    random_picks.shuffle
    land_ids.shuffle
    
    land_ids.each do |id|
      player = random_picks.pop
      land = self.lands.create(:player => player, :deployment => 3, :map_land_id => id)
      
      if (player != nil)
        player.lands << land
      end
    end
    
    job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 15.seconds.from_now)
    self.state = Game::STARTED_STATE
    self.turn_timer_id = job.id
    self.save
    
    player = self.players.sample
    player.is_turn = true
    player.save
    
    Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "Game Started", :name => "Server"})
    Pusher[self.name].trigger(GameMsgType::CHATLINE, {:entry => "#{player.user.username}'s turn has started.", :name => "Server"})
    
    data = { :who_am_i => self.players.first.id, 
             :map_layout => ActiveSupport::JSON.decode(self.map.json),
             :players => self.players,
             :deployment => self.lands }
                   
    Pusher[self.name].trigger(GameMsgType::START, data)
  end
  
  # Check whether or not the land is owned by the player
  private
  def does_player_own_land?(player, land)
    
  end
  
  # Get random roll results
  private
  def roll(num_dice)
    num_dice.times.map{ 1+Random.rand(6) } 
  end
end
