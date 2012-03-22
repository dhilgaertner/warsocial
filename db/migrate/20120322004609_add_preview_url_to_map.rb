class AddPreviewUrlToMap < ActiveRecord::Migration
  def change
    add_column :maps, :preview_url, :string
    add_column :maps, :is_public, :boolean, :default => false
    add_column :maps, :is_admin_only, :boolean, :default =>true
  end
end
