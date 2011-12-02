class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.integer :user_id
      t.integer :seat_number

      t.timestamps
    end
  end
end
