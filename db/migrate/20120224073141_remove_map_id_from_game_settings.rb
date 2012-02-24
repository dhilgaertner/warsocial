class RemoveMapIdFromGameSettings < ActiveRecord::Migration
  def up
    remove_column :game_settings, :map_id
  end

  def down
    add_column :game_settings, :map_id, :integer
  end
end
