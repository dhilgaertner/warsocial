class Map < ActiveRecord::Base
  has_many :games
  
  attr_accessible :name, :json, :preview_url, :is_public, :is_admin_only

  def as_json(options={})
    { :name => self.name,
      :preview_url => self.preview_url }
  end

end