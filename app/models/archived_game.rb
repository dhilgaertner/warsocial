class ArchivedGame < ActiveRecord::Base
  attr_accessible :map_json, :map_name, :name, :type, :wager
end
