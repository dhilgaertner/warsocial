class AddTurnTimerToGame < ActiveRecord::Migration
  def change
    add_column :games, :turn_timer_id, :integer
  end
end
