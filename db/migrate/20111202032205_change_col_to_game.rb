class ChangeColToGame < ActiveRecord::Migration
  def change
    change_column :players, :is_turn, :boolean, :default => false
  end
end
