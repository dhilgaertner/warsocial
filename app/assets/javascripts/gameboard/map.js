/*
 * Map Class
 */

function Map(w, h, tilelist) {
    var width = (w != undefined && w.constructor === Number)? w : 0; // Number of cell in a row of the map
    var height = (h != undefined && h.constructor === Number)? h : 0; // Number of cell in a col of the map
    var tiles = (tilelist instanceof Array)? tilelist : []; // List of all tiles in the map from to top left to bottom right
    var land_list = []; // List of all lands in the map

    this.getLandList = function() { return land_list; };
    this.getWidth = function() { return width; };
    this.getHeight = function() { return height; };
    this.getTiles = function() { return tiles; };

    // Create Land List from tiles
    if (width > 0 && height > 0) {
        land_list = this.createLandList(tilelist);
         if (land_list.length > 0) {
            tiles = tilelist;
        }
    }

    // Find adjacent lands from tiles
    this.find_adjacent_lands_from_tiles(tiles, width, height);
    // Finally, create the canvas drawer
    var myMapCanvas = new MapCanvas(); // ref to map canvas object (map drawer)

    this.getMapCanvas = function() { return myMapCanvas; };
}

Map.prototype.toString = function() {
    return ("[Map]");
};

Map.prototype.createLandList = function(list) {
      var lands = new Array();
      if (list == undefined) return lands;
      var len = list.length;
      var index = 0;
      while (index < len) {
          if (list[index] != 0 && lands[list[index]] == undefined) {
             lands[list[index]] = new Land(list[index]);
          }
          index++;
      }
      return lands;
};

/**
 * Find adjacent lands and setup lands
 * @param tiles Tiles of the map
 */
Map.prototype.find_adjacent_lands_from_tiles = function ( tiles, width_line, height_col ) {
    // main loop
    for (var row = 0; row < height_col; row++ ) {
         for (var col = 0; col < width_line; col++ ) {
             // get all needed tiles index
             var t_index = row*width_line + col;
             if (tiles[t_index] == 0) continue; // Continue if this tile is an empty land
             if ((col%2 == 1) && (row == height_col-1)) continue; // no search in the last row for even number id tile

             var right_tile_index = undefined;
             if (col != width_line-1) { // If this tile is the last one of the column, no comparison with the right
                 right_tile_index = (col%2 == 0)? t_index + 1 : t_index + 1 + width_line; // Right tile is one line further for even id tiles
             }

             var left_tile_index = undefined;
             if (col != 0) { // If this tile is the first one of the column, no comparison with the left
                left_tile_index = (col%2 == 0)? t_index - 1 : t_index - 1 + width_line; // Left tile is one line further for even id tiles
             }

             var bottom_tile_index = undefined;
             if ( row != height_col-1 ) {  // If this tile is in the last row of the map, no comparison with bottom line
                bottom_tile_index = t_index + width_line;
             }
             //alert("index = " + t_index + " right " + right_tile_index + " left " + left_tile_index);
             // now compare
             // with left tile if exists
             if (left_tile_index != undefined && tiles[t_index] != tiles[left_tile_index] && tiles[left_tile_index] != 0) {
                this.find_land_by_id(tiles[t_index]).addAdjacentLandId(tiles[left_tile_index]);
                this.find_land_by_id(tiles[left_tile_index]).addAdjacentLandId(tiles[t_index]);
             }

             // with right tile if exists
             if (right_tile_index != undefined && tiles[t_index] != tiles[right_tile_index] && tiles[right_tile_index] != 0) {
                this.find_land_by_id(tiles[t_index]).addAdjacentLandId(tiles[right_tile_index]);
                this.find_land_by_id(tiles[right_tile_index]).addAdjacentLandId(tiles[t_index]);
             }

             // with bottom tile if exists
             if (bottom_tile_index != undefined && tiles[t_index] != tiles[bottom_tile_index] && tiles[bottom_tile_index] != 0) {
                this.find_land_by_id(tiles[t_index]).addAdjacentLandId(tiles[bottom_tile_index]);
                this.find_land_by_id(tiles[bottom_tile_index]).addAdjacentLandId(tiles[t_index]);
             }
         }
    }
};


/**
 * Find a Land Object in landList by land id.
 * @param land_id integer
 * @return Land Object or null if not found
 */
Map.prototype.find_land_by_id = function(land_id) {
    if (land_id != undefined) {
        var landlist = this.getLandList();
        return landlist[land_id];
    }
    return null;
};

/**
 * Find a Land Object in landList by owner (Player Object).
 * @param player_id integer
 * @return Land Object or null if not found
 */
Map.prototype.find_lands_by_player_id = function ( player_id ) {
  var list = [];
  if (player_id != undefined && player_id.constructor === Number) {
    var index = 0;
    while (index < this.getLandList().length) {
        //alert("search : " + index + " " + this.getLandList())
        if (this.getLandList()[index] != undefined && this.getLandList()[index].getOwner() != null && this.getLandList()[index].getOwner().getId() == player_id) list.push(this.getLandList()[index]);
        index++;
    }
  }
  return list;
};

/**
 * Change land ownership and/or troop number.
 * @param land_id Id (integer) of the Land to be changed
 * @param player Player Object if an owner must be defined (or null)
 * @param troops Number of troops to put on the land (integer)
 */
Map.prototype.claim = function (land_id, player, troops) {

   var l = this.find_land_by_id(land_id);
   if (l != null && (player instanceof Player || player == null)) {
       l.setOwner(player);
       if (troops != undefined && troops.constructor === Number) l.setTroops(troops);
   }
};

Map.prototype.free_land_owned_by = function( player_id ) {
  // get the list of lands
  var lands = [];
  if (player_id != undefined && player_id.constructor === Number) {
      lands = this.find_lands_by_player_id(player_id);

    var index = 0;
    while (index < lands.length) {
        lands[index].setOwner(null);
        index++;
    }
  }
};

/**
 *  Make an array for the canvas to be used to trace the map.
 *  @return Array [land_id => player_id]
 */
Map.prototype.getLandPlayerList = function() {
    var result = [];
    var l = this.getLandList();
    var index = 0;
    while (index < l.length) {
        if (l[index]) result[l[index].getId()] = (l[index].getOwner() != null)? l[index].getOwner().getSeatId() : 0 ;
        index++;
    }
    return result;
};

/**
 * Find Land by coords in tiles array
 */
Map.prototype.getLandByCoords = function(col, row) {
    if (col == undefined || row == undefined || col.constructor != Number || row.constructor != Number ) { return null;  } // invalid values
    if (col < 0 || row < 0 || col > this.getWidth()-1 || row > this.getHeight() ) { return null; } // outside grid index

    var index = row * this.getWidth() + col;
    return this.getTiles()[index];

};

/**
 *  Make an array for the canvas to be used to trace the map.
 *  @return Array [land_id => player_id]
 */
Map.prototype.getDeploymentLandList = function() {
    var result = [];
    var l = this.getLandList();
    var index = 0;
    while (index < l.length) {
        if (l[index]) {
            result[l[index].getId()] = new Array();
            result[l[index].getId()][0] = l[index].getTroops();
            result[l[index].getId()][1] = l[index].getNewTroops();
        }
        // on pourrait supprimer new troops ici
        index++;
    }
    return result;
};


Map.prototype.drawcanvas = function(dicedelay) {
    if (dicedelay == undefined) dicedelay = true;
    this.getMapCanvas().draw_canvas(this.getTiles(), this.getWidth(), this.getHeight(), this.getLandPlayerList(), this.getDeploymentLandList(), dicedelay);
};

/**
 *  Hilight all the lands of a single player to show that it is his turn
 */
Map.prototype.hilight_player_lands = function( player_id ) {
  // get the list of lands
  var lands = [];
  if (player_id != undefined && player_id.constructor === Number) {
    lands = this.find_lands_by_player_id(player_id);

    var index = 0;
    	this.getMapCanvas().unhilight_player_lands();	// clear previous hilight

		// loop through all of the player's land to hilight them
    while (index < lands.length) {
				this.getMapCanvas().hilight_player_land(this.getTiles(), this.getWidth(), this.getHeight(), lands[index].getId());
        index++;
    }
  }
};

/**
 * Interaction
 */

Map.prototype.select = function( land_id, is_origin ) {
    if (is_origin) {
        this.getMapCanvas().hilight_origin_land(this.getTiles(), this.getWidth(), this.getHeight(), land_id);
    } else {
        this.getMapCanvas().hilight_destination_land(this.getTiles(), this.getWidth(), this.getHeight(), land_id);
    }
};

Map.prototype.unselect = function( is_origin ) {
    if (is_origin) {
        this.getMapCanvas().unhilight_origin_land();
    } else {
        this.getMapCanvas().unhilight_destination_land();
    }
};

