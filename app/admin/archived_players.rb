require 'archived/archived_game'
require 'archived/archived_player'

ActiveAdmin.register ArchivedGame do
  index do
    column "Id", :id
    column "Name", :name
    column "Wager", :wager
    column "Type", :game_type
    column "Map", :map_name
    column "Players", :archived_players
    default_actions
  end
end
