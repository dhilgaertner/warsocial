class AddWagerLevelToGameRule < ActiveRecord::Migration
  def change
    add_column :game_rules, :wager_level, :integer, :default => 0
  end
end
