class CreateGameSettings < ActiveRecord::Migration
  def change
    create_table :game_settings do |t|
      t.string :game_name
      t.integer :map_id
      t.integer :player_count

      t.timestamps
    end
  end
end
