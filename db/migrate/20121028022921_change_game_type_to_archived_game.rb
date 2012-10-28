class ChangeGameTypeToArchivedGame < ActiveRecord::Migration
  def change
    change_column :archived_games, :map_json, :text, :limit => nil
  end

end
