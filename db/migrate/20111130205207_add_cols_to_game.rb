class AddColsToGame < ActiveRecord::Migration
  def change
    add_column :games, :name, :string
    add_column :games, :state, :string
  end
end
