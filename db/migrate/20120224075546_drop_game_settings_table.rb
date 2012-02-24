class DropGameSettingsTable < ActiveRecord::Migration
  def change
    drop_table :game_settings
  end
end
