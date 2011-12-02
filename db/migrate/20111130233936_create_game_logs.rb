class CreateGameLogs < ActiveRecord::Migration
  def change
    create_table :game_logs do |t|
      t.integer :game_id
      t.string :type
      t.string :data

      t.timestamps
    end
  end
end
