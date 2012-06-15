class CreateSeasonScores < ActiveRecord::Migration
  def change
    create_table :season_scores do |t|
      t.integer :user_id
      t.integer :points
      t.integer :season_id

      t.timestamps
    end
  end
end
