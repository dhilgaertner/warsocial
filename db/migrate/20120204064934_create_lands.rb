class CreateLands < ActiveRecord::Migration
  def change
    create_table :lands do |t|
      t.integer :game_id
      t.integer :player_id
      t.integer :deployment

      t.timestamps
    end
  end
end
