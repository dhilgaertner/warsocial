class CreateArchivedGames < ActiveRecord::Migration
  def change
    create_table :archived_games do |t|
      t.string :name
      t.int :wager
      t.string :map_name
      t.string :map_json
      t.string :type

      t.timestamps
    end
  end
end
