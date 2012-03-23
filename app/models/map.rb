class Map < ActiveRecord::Base
  has_many :games
  
  attr_accessible :name, :json, :preview_url, :is_public, :is_admin_only

  def as_json(options={})
    { :name => self.name,
      :preview_url => self.preview_url }
  end

  def self.get_map(name)
    maps = Map.where("name = ?", name)

    if maps.size == 0
      return Map.create(:name => name, :json => '{"width":35,"height":25,"land_id_tiles":[0,0,13,13,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,13,13,13,13,0,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,0,0,0,0,0,13,13,13,13,13,1,1,1,0,0,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,13,13,13,13,1,1,1,1,0,0,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,13,13,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,10,10,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,10,10,10,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,4,4,4,4,5,5,5,5,5,5,10,10,10,10,8,8,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,4,4,4,4,5,5,5,5,5,10,10,10,10,8,8,8,8,0,0,0,0,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,8,0,0,3,3,3,3,3,0,0,0,2,2,2,2,2,2,2,2,0,0,6,6,6,6,6,6,6,8,8,8,8,8,8,8,8,0,3,3,3,3,3,3,0,0,0,0,2,2,2,2,2,2,0,0,6,6,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,3,3,3,3,3,3,3,3,0,0,2,2,2,2,2,2,0,0,0,6,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,3,3,3,3,3,3,3,3,3,3,3,11,11,11,2,2,2,0,0,6,6,6,6,6,6,6,8,8,8,8,8,8,8,8,8,3,3,3,3,3,3,3,3,3,3,3,11,11,11,11,2,2,2,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,8,8,3,3,3,3,3,3,3,3,3,3,3,11,11,11,9,9,9,9,9,6,6,6,6,6,6,7,7,7,7,7,8,8,8,8,8,3,3,3,3,3,3,3,3,3,3,3,11,11,11,9,9,9,9,9,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8,0,0,3,3,3,3,3,3,3,3,0,0,0,0,9,9,9,9,9,9,9,9,9,9,7,7,7,7,7,7,7,7,8,8,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,9,9,9,9,9,9,9,9,9,9,9,7,7,7,7,7,7,7,8,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,12,12,7,7,7,7,7,7,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,12,12,12,7,7,7,7,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,9,9,9,9,9,9,12,12,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,9,9,9,9,9,12,12,12,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,9,9,12,12,12,12,12,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,9,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,12,0,0,0,0,0,0,0,0],"neutral_land_color":"#CCCCCC"}')
    else
      return maps.first
    end
  end
  
  def get_lands
    map_layout = ActiveSupport::JSON.decode(self.json)
    
    width = map_layout["width"]
    height = map_layout["height"]
    tiles = map_layout["land_id_tiles"]
    
    lands = Hash.new
    
    tiles.each_with_index do |tile, index|
      if (tile != 0) 
        if (lands[tile] == nil)
          lands[tile] = Array.new
        end 
      end
    end
    
    for row in 0..(height-1)
       for col in 0..(width-1)
          t_index = row * width + col   # the current tile index; very important
          if (tiles[t_index] == 0) 
            next 
          end   # continue if this tile is an empty land
          if ((col%2 == 1) && (row == height-1)) 
            next 
          end
          
          right_tile_index = nil
          if (col != width-1)  #If this tile is the last one of the column, no comparison with the right
            right_tile_index = (col%2 == 0) ? t_index + 1 : t_index + 1 + width   #Right tile is one line further for even id tiles
          end
          
          left_tile_index = nil
          if (col != 0)   # If this tile is the first one of the column, no comparison with the left
            left_tile_index = (col%2 == 0) ? t_index - 1 : t_index - 1 + width    # Left tile is one line further for even id tiles
          end
          
          bottom_tile_index = nil
          if (row != height-1)   # If this tile is in the last row of the map, no comparison with bottom line
            bottom_tile_index = t_index + width
          end
          
          # now compare with left tile if exists
          if (left_tile_index != nil && tiles[t_index] != tiles[left_tile_index] && tiles[left_tile_index] != 0)
            if (!lands[tiles[t_index]].include?(tiles[left_tile_index]))
              lands[tiles[t_index]].push(tiles[left_tile_index])
            end
            if (!lands[tiles[left_tile_index]].include?(tiles[t_index]))
              lands[tiles[left_tile_index]].push(tiles[t_index])
            end
          end

          # with right tile if exists
          if (right_tile_index != nil && tiles[t_index] != tiles[right_tile_index] && tiles[right_tile_index] != 0) 
            if (!lands[tiles[t_index]].include?(tiles[right_tile_index]))
              lands[tiles[t_index]].push(tiles[right_tile_index])
            end
            if (!lands[tiles[right_tile_index]].include?(tiles[t_index]))
              lands[tiles[right_tile_index]].push(tiles[t_index])
            end
          end

          # with bottom tile if exists
          if (bottom_tile_index != nil && tiles[t_index] != tiles[bottom_tile_index] && tiles[bottom_tile_index] != 0)
            if (!lands[tiles[t_index]].include?(tiles[bottom_tile_index]))
              lands[tiles[t_index]].push(tiles[bottom_tile_index])
            end
            if (!lands[tiles[bottom_tile_index]].include?(tiles[t_index]))
              lands[tiles[bottom_tile_index]].push(tiles[t_index])
            end
          end
       end
    end
    
    return lands
  end
  
  def is_connected(land_id, land2_id)
    lands = self.get_lands
    
    return lands[land_id].include?(land2_id)
  end
end