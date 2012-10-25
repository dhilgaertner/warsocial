class CreateArchivedPlayers < ActiveRecord::Migration
  def change
    create_table :archived_players do |t|
      t.int :user_id
      t.int :archived_game_id
      t.int :seat_number
      t.int :delta_points
      t.int :finishing_place

      t.timestamps
    end
  end
end
