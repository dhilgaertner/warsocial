class CreateTimeSeries < ActiveRecord::Migration
  def change
    create_table :time_series do |t|
      t.string :name
      t.string :key
      t.string :value

      t.timestamps
    end

    add_index :time_series, :name
    add_index :time_series, :key
    add_index :time_series, :created_at
  end
end
