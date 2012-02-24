class AddMapNameToGameSettings < ActiveRecord::Migration
  def change
    add_column :game_settings, :map_name, :string
  end
end
