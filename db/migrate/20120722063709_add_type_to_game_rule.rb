class AddTypeToGameRule < ActiveRecord::Migration
  def change
    add_column :game_rules, :type, :string, :default => "normal"
  end
end
