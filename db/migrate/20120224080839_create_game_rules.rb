class CreateGameRules < ActiveRecord::Migration
  def change
    create_table :game_rules do |t|
      t.string :game_name
      t.string :map_name
      t.integer :player_count

      t.timestamps
    end
  end
end
