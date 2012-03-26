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

  def as_json(options={})
    rules = GameRule.where("game_name = ?", self.name).first

    { :name => self.name,
      :state => self.state,
      :players => self.players,
      :max_players => rules == nil ? 2 : rules.player_count,
      :map => self.map.name
    }
  end

end
