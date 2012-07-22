class FixColumnName < ActiveRecord::Migration
  def change
    rename_column :game_rules, :type, :game_type
  end
end
