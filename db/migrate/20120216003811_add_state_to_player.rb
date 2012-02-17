class AddStateToPlayer < ActiveRecord::Migration
  def change
    add_column :players, :state, :string, :default => Player::DEFAULT_PLAYER_STATE
  end
end
