class AddPointsToUser < ActiveRecord::Migration
  def change
    add_column :users, :current_points, :integer, :default => 0
    add_column :users, :total_points, :integer, :default => 0
  end
end
