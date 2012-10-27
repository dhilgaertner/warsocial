class CreateArchivedPlayers < ActiveRecord::Migration
  def change
    create_table :archived_players do |t|
      t.integer :user_id
      t.integer :archived_game_id
      t.integer :seat_number
      t.integer :delta_points
      t.integer :finishing_place

      t.timestamps
    end
  end
end
