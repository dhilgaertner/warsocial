#require 'archived/archived_game'
#require 'archived/archived_player'
#
#ActiveAdmin.register ArchivedGame do
#  index do
#    column "Id", :id
#    column "Name", :name
#    column "Wager", :wager
#    column "Type", :game_type
#    column "Map", :map_name
#    column "Players" do |game|
#      table_for game.archived_players do
#        column "Username" do |player|
#          player.user.username
#        end
#        column :finishing_place
#        column :delta_points
#      end
#
#    end
#    default_actions
#  end
#end
