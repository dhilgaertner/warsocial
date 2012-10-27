class ArchivedGame < ActiveRecord::Base
  has_many :archived_players, :dependent => :destroy

  attr_accessible :map_json, :map_name, :name, :type, :wager
end
