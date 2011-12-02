class AddIsTurnToPlayer < ActiveRecord::Migration
  def change
    add_column :players, :is_turn, :boolean
  end
end
