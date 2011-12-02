class Game < ActiveRecord::Base
  has_many :players, :dependent => :destroy
  has_many :game_logs, :dependent => :destroy
  
  require 'constants/message_type'
  
  # Game States
  WAITING_STATE = "waiting for players"
  STARTED_STATE = "game started"
  FINISHED_STATE = "game finished"
  
  # Setup accessible (or protected) attributes for your model
  attr_accessible :name, :state, :turn_timer_id
  
  def self.get_game(name)
    games = Game.where("name = ? AND state != ?", name, Game::FINISHED_STATE)
    
    if games.size == 0 
      return Game.create(:name => name)
    else
      return games.first
    end
  end
  
  # Sit player at game table.
  def add_player(user)
    if self.state == Game::WAITING_STATE
      seat = self.players.size + 1
      new_player = self.players.create(:user => user, :seat_number => seat, :is_turn => false)
      
      Pusher[self.name].trigger(MsgType::CHATLINE, {:entry => "#{seat} player(s) seated.", :name => "Server"})
      
      if self.players.size == 2 
        self.state = Game::STARTED_STATE
        player = self.players.sample
        Pusher[self.name].trigger(MsgType::CHATLINE, {:entry => "Game Started", :name => "Server"})
        Pusher[self.name].trigger(MsgType::CHATLINE, {:entry => "#{player.user.username}'s turn has started.", :name => "Server"})
        job = Delayed::Job.enqueue(TurnJob.new(self.name), :run_at => 10.seconds.from_now)
        self.turn_timer_id = job.id
        self.save
      end
      
      return new_player
    else 
      return nil
    end
  end
  
  
end
