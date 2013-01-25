class AddMapCenterColumnToMaps < ActiveRecord::Migration
  def change
    add_column :maps, :user_id, :integer
    add_column :maps, :desc, :text
  end
end
