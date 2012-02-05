class AddMapLandIdToLands < ActiveRecord::Migration
  def change
    add_column :lands, :map_land_id, :integer
  end
end
