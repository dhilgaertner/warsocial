class AddMapIdToGames < ActiveRecord::Migration
  def change
    add_column :games, :map_id, :integer
  end
end
