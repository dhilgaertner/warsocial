class ArchivedGame < ActiveRecord::Base
  has_many :archived_players, :dependent => :destroy

  attr_accessible :map_json, :map_name, :name, :game_type, :wager, :created_at

  def self.map_usage_counts
    return ArchivedGame.count(:group => :map_name)
  end
end
