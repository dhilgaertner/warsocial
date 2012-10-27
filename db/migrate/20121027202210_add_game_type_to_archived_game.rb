class AddGameTypeToArchivedGame < ActiveRecord::Migration
  def change
    add_column :archived_games, :game_type, :string
    remove_column :archived_games, :type
  end
end
