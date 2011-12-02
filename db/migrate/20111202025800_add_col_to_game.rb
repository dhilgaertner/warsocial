class AddColToGame < ActiveRecord::Migration
  def change
    change_column :games, :state, :string, :default => Game::WAITING_STATE
  end
end
