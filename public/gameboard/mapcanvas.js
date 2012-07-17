/**
 * Class from Mapdrawer
 */

function MapCanvas() {

    // CANVAS NAMES SHOULD BE PUT INTO CONSTANTS
    var SHAPE_WIDTH = 28;			  // width of the hexagon shape (larger than one column)
    var shape_points_x = [4, 16, 20, 16, 4, 0, 4];		// x coordinates of the hexagon shape
    var shape_points_y = [0, 0, 6, 12, 12, 6, 0];			// y coordinates of the hexagon shape
    var canvas_margin = 30;		// margin of the canvas to offset all coordinates
    var row_height = 12;			// height of one row of hexagons
    var col_width = 16;				// width of one column of hexagons
    var player_colour_fill = ["#CCCCCC", "#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac", "#814f2e"];
    var player_colour_stroke = ["#CCCCCC", "#ffcc00", "#296dff", "#ed1a1a", "#86ce28", "#7743ec", "#2bb9dd", "#ca43ec", "#a26136"];
    var first_display = true; // record if the shadows have been drawned or not
    var DICE_DELAY = 100; // delay between 2 dices showing in millisec
    var mapdicetimer; // timer for the dice
    var delayed_dice_array; // Array of dice to display
    var land_dice_positions;    // An array storing the precalculated x, y dice positions with the id of each land (the array is sorted in the order that they should be drawn)
    var dice_canvas_list;       // An array storing references to each of the dice canvas layers

    this.getColWidth = function() { return col_width; };
    this.getRowHeight = function() { return row_height; };
    this.getCanvasMargin = function() { return canvas_margin; };
    this.getShapePointX = function() { return shape_points_x; };
    this.getShapePointY = function() { return shape_points_y; };
    this.getShapeWidth = function() { return SHAPE_WIDTH; };
    this.getMapDiceTimer = function() { return mapdicetimer; };
    this.setMapDiceTimer = function() { if (mapdicetimer != undefined) clearInterval(mapdicetimer); var scop = this; mapdicetimer = setInterval(function(){ scop.show_new_die()}, DICE_DELAY); };
    this.getTopLayerCanvas = function() { return document.getElementById("canvas_dice"); };
    this.setDelayedDiceArray = function (d) { delayed_dice_array = d; };
    this.getDelayedDiceArray = function() { return delayed_dice_array; };
    this.setLandDicePositions = function(d) { land_dice_positions = d; };
    this.getLandDicePositions = function() {return land_dice_positions; };
    this.setDiceCanvasList = function (d) { dice_canvas_list = d;} ;
    this.getDiceCanvasList = function() {return dice_canvas_list; };

    this.get_first_display = function() { return first_display; };
    this.set_first_display = function(bool) { first_display = bool; };

    // Careful, this player color stroke will be dynamic and might change
    this.getPlayerColourFill = function() { return player_colour_fill; };
    this.getPlayerColourStroke = function() { return player_colour_stroke; };
}

/**
 *
 * Hex to R, G, B
 */
MapCanvas.prototype.hexToR = function( h ) { return parseInt((this.cutHex(h)).substring(0,2),16) };
MapCanvas.prototype.hexToG = function( h ) { return parseInt((this.cutHex(h)).substring(2,4),16) };
MapCanvas.prototype.hexToB = function( h ) { return parseInt((this.cutHex(h)).substring(4,6),16) };
MapCanvas.prototype.cutHex = function( h ) { return (h.charAt(0)=="#") ? h.substring(1,7):h };

/**
*	Get x coordinates on the canvas from the column number
**/
MapCanvas.prototype.get_x_from_col = function( col ){
	return ( this.getColWidth() * col + this.getCanvasMargin() );
};

/**
*	Get y coordinates on the canvas from the row and column number
* (column is needed because in a hex grid the y coordinate is offset depending on which column it is in)
**/
MapCanvas.prototype.get_y_from_row_col = function(row, col){
	var y = this.getRowHeight() * row + this.getCanvasMargin();
	if (col % 2 == 1){	y += this.getRowHeight()/2;	}	// offset y position by half a row for odd columns
	return (y);
};

MapCanvas.prototype.getTileIndexFromCoords = function( x, y) {
    if (x != undefined && x.constructor === Number && y != undefined && y.constructor === Number) {
        var col = Math.floor( (x - this.getCanvasMargin()) / this.getColWidth() );
        var substract = (col % 2 == 1)? this.getRowHeight()/2 : 0;
        var row = Math.floor((y-this.getCanvasMargin()-substract)/this.getRowHeight());

        return [col, row];
    }
    return null;
};


/**
*	Draw hexagon shape
**/
MapCanvas.prototype.draw_shape = function(x, y, canvas, fill, stroke) {
    canvas.beginPath();
	canvas.moveTo(x+this.getShapePointX()[0],y+this.getShapePointY()[0]);
	for (var i=1; i<6; i++){
		canvas.lineTo(x+this.getShapePointX()[i],y+this.getShapePointY()[i]);
	}
	canvas.fillStyle=fill;
	canvas.fill();
	if (stroke != null){
		canvas.strokeStyle=stroke;
		canvas.lineWidth = 1;
		canvas.stroke();
	}
	canvas.closePath();
};

/**
*	Draw border around hexagon shape
**/
MapCanvas.prototype.draw_border = function(x, y, canvas, border, stroke, line_width) {
	canvas.lineWidth = line_width;
	for (var i=0; i<6; i++){
		// test binary bit, draw the border if the bit is 1
		if ((border >> i) & 1 == 1){
			canvas.beginPath();
			canvas.strokeStyle=stroke;
			canvas.moveTo(x+this.getShapePointX()[i],y+this.getShapePointY()[i]);
			canvas.lineTo(x+this.getShapePointX()[i+1],y+this.getShapePointY()[i+1]);
			canvas.stroke();
			canvas.closePath();
		}
	}
};

/**
*	Draw a hexagon tile on the grid
**/
MapCanvas.prototype.draw_tile = function(row, col, player_colour_id, frontier_border, inside_border) {
	var i;
	var x, y;
	var stroke = this.getPlayerColourStroke()[player_colour_id];
	var fill = this.getPlayerColourFill()[player_colour_id];
    //console.log ("Mapcanvas draw_tile - color fill = " + fill + " player color id = " + player_colour_id );
	var c=document.getElementById("canvas_map");
	var ctx=c.getContext("2d");
	ctx.lineCap="round";

	// get x, y coordinates from row, col
	x = this.get_x_from_col(col);
	y = this.get_y_from_row_col(row, col);

	ctx.save();			// save context before clipping
    this.draw_shape(x, y, ctx, fill, fill);		// draw shape
	ctx.clip();			// clip so that strokes don't extend out of the shape

	//draw inside top borders (use binary operation to select only the top borders)
	this.draw_border(x, y, ctx, inside_border & parseInt("100011",2), "rgba(255, 255, 255, 0.25)", 2);

	//draw inside bottom borders (use binary operation to select only the bottom borders)
	this.draw_border(x, y, ctx, inside_border & parseInt("011100",2), "rgba(0, 0, 0, 0.25)", 2);

	// draw hilight border
	this.draw_border(x, y, ctx, frontier_border, "rgba(255, 255, 255, 0.75)", 6);

	// draw frontier border
	this.draw_border(x, y, ctx, frontier_border, stroke, 4);

	ctx.restore();	// restore to before clipping
};

/**
*	Draw shadow
* - draw entire shape of the map and apply the shadow to it
**/
MapCanvas.prototype.draw_shadow = function (map_data, map_width, map_height, canvas) {
    var ctx=canvas.getContext("2d");
	var r, c;
	var shadow_offset_y = 1;
	var shadow_offset_x = 0;
	var shadow_shape_fill = "#444";
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 3;
	ctx.shadowBlur    = 7;
	ctx.shadowColor   = "rgba(0,0,0,0.4)";
    var canvas2 = document.getElementById("canvas_map");
    var ctx2=canvas2.getContext("2d");
    ctx.drawImage(canvas2, 0, 0, canvas2.width, canvas2.height);
	/*for (r=0; r<map_height; r++){
		for (c=0; c<map_width; c++){

			// draw shape if not 0 (empty)
			if (map_data[r*map_width + c] != 0){
				// get x, y coordinates from row, col
				var	x = this.get_x_from_col(c);
				var y = this.get_y_from_row_col(r, c);

				x += shadow_offset_x;
				y += shadow_offset_y;

				this.draw_shape(x, y, ctx, shadow_shape_fill, shadow_shape_fill);
			}
		}
	} */
};

/**
*	Draw texture
* - draw entire shape of the map and apply the pattern to it
**/
MapCanvas.prototype.draw_texture = function(map_data, map_width, map_height, canvas, img) {
    var ctx=canvas.getContext("2d");
	var r, c;
    var pattern_fill=ctx.createPattern(img,"repeat");
    if (pattern_fill != null) {
        for (r=0; r<map_height; r++){
            for (c=0; c<map_width; c++){

                // draw shape if not 0 (empty)
                if (map_data[r*map_width + c] != 0){
                    // get x, y coordinates from row, col
                    var	x = this.get_x_from_col(c);
                    var y = this.get_y_from_row_col(r, c);
                    this.draw_shape(x, y, ctx, pattern_fill);
                }
            }
        }
    }
};

/**
*	Get the map id of an adjacent tile given the current tile's row/col and the side of the hexagon
* side is define bewteen 0-5, with 0 being the top side of the hexagon, then going clockwise ending at 5 being the top-left side of the hexagon
**/
MapCanvas.prototype.get_adjacent_tile_id = function (r, c, map_data, map_width, map_height, side) {
    var adjacent_row, adjacent_col;

	// get the row, col of the adjacent tile depending on the side it is on
	switch (side){
		case 0:	// top
						adjacent_row = r - 1;
						adjacent_col = c;
						break;
		case 1: // top-right
						adjacent_row = r - 1;
						adjacent_col = c + 1;
						break;
		case 2: // bottom-right
						adjacent_row = r;
						adjacent_col = c + 1;
						break;
		case 3: // bottom
						adjacent_row = r + 1;
						adjacent_col = c;
						break;
		case 4:	// bottom-left
						adjacent_row = r;
						adjacent_col = c - 1;
						break;
		case 5: // top-left
						adjacent_row = r - 1;
						adjacent_col = c - 1;
						break;
	}

	// offset row by one for odd columns with adjacent tiles in the left or right
	if (c % 2 == 1){
		if (side==1 || side==2 || side==4 || side==5){
			adjacent_row++;
		}
	}
    // check out of bounds
	if ((adjacent_col >= map_width) || (adjacent_col < 0) || (adjacent_row >= map_height) || (adjacent_row < 0)){ return null; }
	return(map_data[adjacent_row*map_width + adjacent_col]);
};

/**
*	Draw tiles
**/
MapCanvas.prototype.draw_tiles = function (map_data, map_width, map_height, land_owner) {
    var r, c;
	for (r=0; r<map_height; r++){
		for (c=0; c<map_width; c++){

			// draw tile if not 0 (empty)
			if (map_data[r*map_width + c] != 0){
				var current_tile_id = map_data[r*map_width + c];		// map id of the current tile
				var current_tile_id = map_data[r*map_width + c];		// map id of the current tile
				// apply border
				// - border is stored as a binary number where each bit corresponds to one side of the hexagon
				// - setting a bit to 1 means the corresponding side of the hexagon has a border
				// - the least significant bit corresponds to the top side of the hexagon,
				//	 each subsequent bit is the next side of the hexagon going clockwise (i.e. the last bit is the top-left side of the polygon)
				// - example: 100111 = hexagon with top, top-right, bottom-right, and top-left borders
				var frontier_border = 0;
				var	inside_border = 0;

				// loop through the sides of the hexagon, starting from the top and going clockwise
				for (var s=0; s<6; s++){
					var adjacent_tile_id = this.get_adjacent_tile_id(r, c, map_data, map_width, map_height, s);

					// apply border if the adjacent tile and the current tile does not have the same id
					if (adjacent_tile_id != current_tile_id){
						// apply a frontier border if the tiles are owned by different players
						if (land_owner[adjacent_tile_id] != land_owner[current_tile_id]){
							frontier_border = frontier_border | (1 << s);		// set the bit
						}
						// apply an inside border if the tiles are owned by the same player
						else {
							inside_border = inside_border | (1 << s);		// set the bit
						}
					}
				}

				this.draw_tile(r, c, land_owner[current_tile_id], frontier_border, inside_border);
			}
		}
	}
};

/**
 * Clear tiles
 */
MapCanvas.prototype.clear_all = function() {
    var canvas = document.getElementById("canvas_map");
    if (canvas != null) {
        var ctx=canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height);
    }
};

/**
 * Clear shadow
 */
MapCanvas.prototype.eraseMap = function () {
    this.clearDice();
    this.clear_all();
    canvas = document.getElementById("canvas_shadow");
    if (canvas != null) {
        ctx=canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height);
    }

    this.set_first_display(false); // Next time, shadows will have to be drawn too
};

MapCanvas.prototype.draw_canvas = function(land_id_tiles, map_width, map_height, land_owner, land_troops, dicedelay){
    //var start = new Date().getTime();
    this.draw_tiles(land_id_tiles, map_width, map_height, land_owner, document.getElementById("canvas_map"));
	if (this.get_first_display()) {
        this.draw_shadow(land_id_tiles, map_width, map_height, document.getElementById("canvas_shadow"));
        this.calculate_dice_positions(land_id_tiles, map_width, map_height);
    }
	this.draw_texture(land_id_tiles, map_width, map_height, document.getElementById("canvas_map"), document.getElementById("pattern"));
    this.add_dice(land_id_tiles, map_width, map_height, land_troops, land_owner, dicedelay);
    this.set_first_display(false);
   // var end = new Date().getTime();
    //var time = end - start;
    //console.log('Execution time MapCanvas - draw_canvas: ' + time);
};

/**
* Calculate and store the position to put the dice for each land
**/
MapCanvas.prototype.calculate_dice_positions = function(map_data, map_width, map_height){
    var temp_array = [];
    var land_dice_positions = [];

    // look at the map and get dice positions, store in temp array
	for (r=0; r<map_height; r++){
		for (c=0; c<map_width; c++){

			var current_tile_id = map_data[r*map_width + c];		// map id of the current tile

            // check if this id has already been calculated, and ignore id 0 (space)
            if (temp_array[current_tile_id] == null && current_tile_id != 0){
                // get centre
                var centre_row_col = this.get_centre_row_col(map_data, map_width, map_height, current_tile_id);
                var data = new Object();
                data.x = this.get_x_from_col(centre_row_col[1]);
                data.y = this.get_y_from_row_col(centre_row_col[0], centre_row_col[1]);
                data.id = current_tile_id;

                temp_array[current_tile_id] = data;
            }
		}
	}

    // push temp array into a new array so we have an array with the correct size
    for (element in temp_array){
        land_dice_positions.push(temp_array[element]);
    }

    // sort array according to the x, y positions so when we draw it later the overlapping with be correct
    land_dice_positions.sort(
        function(a, b){
            if (a.y == b.y){       // if y positions equal, sort by x position
                return a.x - b.x;
            }
            else {
                return a.y - b.y;   // sort by y position
            }
        }
    )
 
    this.setLandDicePositions(land_dice_positions);
    this.create_dice_layers();
}

/**
* Create a canvas layer for the dice of each land and assign the correct z-index
**/
MapCanvas.prototype.create_dice_layers = function(){
    // go through the stored dice positions and create canvas layers
    var land_dice_positions = this.getLandDicePositions();
    var container = $("#dice_container");     // get container
    var dice_canvas_list = {};

    for(var i=0; i<land_dice_positions.length; i++){

        var new_canvas = $(document.createElement('canvas'))
            .attr({'id':'dice_canvas_' + land_dice_positions[i].id, 'width':container.width(), 'height':container.height()})
            //.width(container.width())
            //.height(container.height())
            .css({'position':'absolute', 'left':'0', 'top':'0', 'z-index':i})
        ;
        container.append(new_canvas);
        dice_canvas_list[land_dice_positions[i].id] = $("#dice_canvas_"+ land_dice_positions[i].id)[0];
    }

    this.setDiceCanvasList(dice_canvas_list);

}

/**
* Get the row/col of the centre of a piece of land
**/
MapCanvas.prototype.get_centre_row_col = function(map_data, map_width, map_height, id){
	var r, c;
	var row_with_max_col = new Array();		// stores the row(s) with the maximum amount of columns
	var max_num_col = 0;		// store the maximum amount of columns in a row
	var centre = new Array();	// the row, col of the centre

	// go through the map, find the row with the most columns for the land
	for (r=0; r<map_height; r++){
		var num_col = 0;	// number of columns in this row

		for (c=0; c<map_width; c++){
			if (map_data[r*map_width + c] == id){	num_col++; } // if the id matches, count number of columns in this row
		}
		// largest column found
		if (num_col > max_num_col){
			max_num_col = num_col;	// store maximum number of columns
			row_with_max_col = new Array();
			row_with_max_col.push(r);	// store this row

		}
		// found another row with the same maximum amount of columns, store it
		else if (num_col == max_num_col){ row_with_max_col.push(r); }
	}

	// get the centre row (if there are more than one row, take the one in the middle)
	centre[0] = row_with_max_col[Math.round(row_with_max_col.length/2) - 1];

	// go through the row with the most columns, get the column in the middle of the land
	for (c=0; c<map_width; c++){
		// if the id matches
		if (map_data[centre[0]*map_width + c] == id){
			// calculate middle column (current column + the maximum column width divided by 2)
			centre[1] = c + Math.round(max_num_col/2) - 1;
			break;
		}
	}
	return centre;
};


/**
* Add dice to the map given the map data and the deployment
**/
MapCanvas.prototype.add_dice = function(map_data, map_width, map_height, deployment, land_owner, mustdelay){
    if (mustdelay == undefined) mustdelay = true;
   // var start = new Date().getTime();
    var DICE_HEIGHT_MAX = 4;
	var DICE_HEIGHT_OFFSET = 11;
    var DICE_WIDTH_X_OFFSET = 13;
	var DICE_WIDTH_Y_OFFSET = 7;
    var TOTAL_TROOPS = 0; var NEW_TROOPS = 1; // constants used to navigate in deployment array
    var total_delay = 0; // record cumulated delay

    //var canvas = document.getElementById("canvas_dice");
	//var ctx = canvas.getContext("2d");
	var r, c, i, j;
    var this_scope = this;
	// clear canvas
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
    var first_display = this.get_first_display(); // if yes, no delay for the dice
    var delayed_dice_array = new Array();
    var index=0;
    var dice_canvas_list = this.getDiceCanvasList();

	// go through the stored dice positions and add dice
    var land_dice_positions = this.getLandDicePositions();

    for(j=0; j<land_dice_positions.length; j++){

        var land_id = land_dice_positions[j].id;

        // add dice if land id is not 0 and there are dices in the land
        if (land_id != 0 && deployment[land_id][TOTAL_TROOPS] > 0){

            //var canvas = $("#dice_canvas_"+land_id)[0];
            var canvas = dice_canvas_list[land_id];
            var ctx = canvas.getContext("2d");
            var x = land_dice_positions[j].x;
            var y = land_dice_positions[j].y;
            var num_of_dice = deployment[land_id][TOTAL_TROOPS];
            var new_dice = deployment[land_id][NEW_TROOPS];

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // add each dice
            var dice_value = Math.floor(land_owner[land_id]%6 + 1); // assign a dice value based on the player id (this is purely graphical so that there isn't the same pattern on all the dices on the entire map)
            for (i=0; i<num_of_dice; i++){
                var dice_column = Math.floor(i / DICE_HEIGHT_MAX);
                var dice_row = i % DICE_HEIGHT_MAX;
                var shadow = false;
                // draw shadow if first dice in the column (dice is in the first row
                if (dice_row == 0){ shadow = true; }
                var delayed = !first_display;
                if (i < (num_of_dice-new_dice) || !mustdelay) {
                    delayed = false;
                }
                if (!delayed) {
                    this.draw_dice(x+(DICE_WIDTH_X_OFFSET*dice_column), y-(DICE_HEIGHT_OFFSET*dice_row)+(DICE_WIDTH_Y_OFFSET*dice_column), dice_value, shadow, ctx, land_owner[land_id]);   // delay before showing the dice
                } else {
                    var d = new Object();
                    d.x = x+(DICE_WIDTH_X_OFFSET*dice_column);
                    d.y = y-(DICE_HEIGHT_OFFSET*dice_row)+(DICE_WIDTH_Y_OFFSET*dice_column);
                    d.val = dice_value;
                    d.shadow = shadow;
                    d.ctx = ctx;
                    d.colour_id = land_owner[land_id];
                    delayed_dice_array[index] = d;
                    index++;
                }
			}

        }
    }
    if (delayed_dice_array.length > 0) {
        this.setMapDiceTimer();
        this.setDelayedDiceArray(delayed_dice_array);
    }
       // var end = new Date().getTime();
        //var time = end - start;
        //console.log('Execution time addDice in MapCanvas: ' + time);
};

MapCanvas.prototype.show_new_die = function() {
     var list = this.getDelayedDiceArray();
     if (list == undefined ) clearInterval(this.getMapDiceTimer());
     if (list != undefined && list.length > 0) {
         this.draw_dice(list[0].x, list[0].y, list[0].val, list[0].shadow, list[0].ctx, list[0].colour_id);
         list.splice(0,1);
         this.setDelayedDiceArray(list);
         if ( list.length <= 0 ) clearInterval(this.getMapDiceTimer());
     }

	// play sound
	SoundManager.play("sound_click");
};

/**
 * Remove the dice from display
 */
MapCanvas.prototype.clearDice = function() {
    var dice_canvas_list = this.getDiceCanvasList();
    var land_dice_positions = this.getLandDicePositions();
    for(j=0; j<land_dice_positions.length; j++){
        var land_id = land_dice_positions[j].id;
        // add dice if land id is not 0 and there are dices in the land
        if (land_id != 0){
            //var canvas = $("#dice_canvas_"+land_id)[0];
            var canvas = dice_canvas_list[land_id];
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
};

/**
* Draw the dice graphics at a specific spot on the canvas
**/
MapCanvas.prototype.draw_dice = function(x, y, value, has_shadow, context, player_colour_id){
    var DICE_IMG_ID = "dice";
	var DICE_SHADOW_ID = "dice_shadow";
	var IMG_OFFSET_X = 4;
	var IMG_OFFSET_Y = -6;
    var IMG_WIDTH = 20;
	var IMG_HEIGHT = 20;
	var SHADOW_OFFSET_X = IMG_OFFSET_X-2;
	var SHADOW_OFFSET_Y = IMG_OFFSET_Y+4;

	var img = $("#"+(DICE_IMG_ID+value))[0];

	if (has_shadow){
		 var img_shadow = $("#"+DICE_SHADOW_ID)[0];
		context.drawImage(img_shadow, x+SHADOW_OFFSET_X, y+SHADOW_OFFSET_Y);
	}
    
    //draw dice with a colour
    //var canvas_colour = document.createElement('canvas');	// create a temp canvas for the colour of the dice
    var canvas_colour = $("#canvas_dice")[0];
    var canvas_margin = 10;
    var ctx_colour = canvas_colour.getContext('2d');
    var colour_hex = this.getPlayerColourFill()[player_colour_id];
    var colour_alpha = 0.4;
    var colour_rgba = "rgba(" + this.hexToR(colour_hex) + "," + this.hexToG(colour_hex) + "," + this.hexToB(colour_hex) + "," + colour_alpha + ")";

    canvas_colour.width = IMG_WIDTH+canvas_margin*2;
    canvas_colour.height = IMG_HEIGHT+canvas_margin*2;


    ctx_colour.fillStyle = colour_rgba;     // set colour
    ctx_colour.drawImage(img, IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin);  // draw dice image
    ctx_colour.globalCompositeOperation="lighter";      // use 'lighter' to create an overlay colour effect
    ctx_colour.fillRect(IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin, IMG_WIDTH, IMG_HEIGHT);   // draw a coloured rectangle
    ctx_colour.globalCompositeOperation = "destination-in";   // use 'destination-in' to draw dice image again, removing parts of the coloured rectangle that are not on the dice
    ctx_colour.drawImage(img, IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin);

    context.drawImage(canvas_colour, x-canvas_margin, y-canvas_margin);     // add the colour to the dice canvas
    ctx_colour.clearRect(0, 0, canvas_colour.width, canvas_colour.height);

};

/**
 * HILIGHT
 */
MapCanvas.prototype.hilight_land = function(map_data, map_width, map_height, id, canvas, hilight_strength){
  var ctx = canvas.getContext("2d");
	var canvas_mask = document.createElement('canvas');	// create a temp canvas for the mask
	var ctx_mask = canvas_mask.getContext('2d');
	var r, c;
	var min_x, min_y, max_x, max_y;

	min_x = min_y = max_x = max_y = -1;
	canvas_mask.width = canvas.width;
	canvas_mask.height = canvas.height;

	// add shadow to create a glow effect
	ctx_mask.shadowBlur = 5;
	ctx_mask.shadowColor = "rgba(0,0,0,1.0)";

	// go through the map and calculate the min/max x, y and draw a clipping mask
	for (r=0; r<map_height; r++){
		for (c=0; c<map_width; c++){
			// if the id matches
			if (map_data[r*map_width + c] == id){
				var	x = this.get_x_from_col(c);
				var y = this.get_y_from_row_col(r, c);

				// get the minimum x, y and the maximum x, y coordinates of the land
				if (min_x==-1 || min_x>x) { min_x = x; }
				if (min_y==-1 || min_y>y) { min_y = y; }
				if (max_x<x) { max_x = x; }
				if (max_y<y) { max_y = y; }

				this.draw_shape(x, y, ctx_mask, "#000000", "#000000");	// draw shape to create mask
			}
		}
	}

	max_y += this.getRowHeight(); // add height of the last shape
	max_x += this.getShapeWidth(); // add width of the last shape

	min_x -= ctx_mask.shadowBlur;	// add margin for glow
	min_y -= ctx_mask.shadowBlur;	// add margin for glow
	max_x += ctx_mask.shadowBlur;	// add margin for glow
	max_y += ctx_mask.shadowBlur;	// add margin for glow

	// find the centre of the radial gradient
	var x_centre = min_x+(max_x-min_x)/2;
	var y_centre = min_y+(max_y-min_y)/2;
	var radius;

	// take the largest width or height as the radius
	if (max_x-min_x > max_y-min_y){
		radius = (max_x-min_x)/2;
	}
	else {
		radius = (max_y-min_y)/2;
	}

	// draw gradient hilight
	var gradient = ctx.createRadialGradient(x_centre, y_centre, 0, x_centre, y_centre, radius);
	gradient.addColorStop(0.0,"rgba(255, 255, 255," + hilight_strength + ")");   // 0.9
	gradient.addColorStop(1.0,"rgba(255, 255, 255," + hilight_strength/2 + ")");   // 0.5
	ctx.globalCompositeOperation="source-out";
	ctx.drawImage(canvas_mask, 0, 0);
	ctx.globalCompositeOperation="source-in";	// use source-in for the mask effect
	ctx.fillStyle = gradient;
	ctx.fillRect(min_x, min_y, max_x-min_x, max_y-min_y);
};


/**
* Hilight the player's land to show is his turn, given its id
**/
MapCanvas.prototype.hilight_player_land = function(map_data, map_width, map_height, id){
		var canvas_hilight = document.getElementById("canvas_hilight_player");

		if (canvas_hilight != null){
		
			var canvas_hilight_ctx = canvas_hilight.getContext("2d");
			var canvas_temp = document.createElement('canvas');	// create a temp canvas for the mask

			canvas_temp.width = canvas_hilight.width;
			canvas_temp.height = canvas_hilight.height;

		  // hilight only if not an empty space (id = 0)
		  if (id != 0){
				// hilight a land in a temp canvas
			  this.hilight_land(map_data, map_width, map_height, id, canvas_temp, 0.5);

				// copy the hilighted land to another canvas			
				canvas_hilight_ctx.drawImage(canvas_temp, 0, 0);
		  }
			this.unhilight_origin_land();
		}
};

/**
* Unhilight the player's land
**/
MapCanvas.prototype.unhilight_player_lands = function(){
	var canvas = document.getElementById("canvas_hilight_player");
	if (canvas != null){
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
};

/**
* Hilight the origin land, given its id
**/
MapCanvas.prototype.hilight_origin_land = function(map_data, map_width, map_height, id){
    // hilight only if not an empty space (id = 0)
    if (id != 0){
	    this.hilight_land(map_data, map_width, map_height, id, document.getElementById("canvas_hilight_origin"), 0.9);
    }
};

/**
* Hilight the destination land, given its id
**/
MapCanvas.prototype.hilight_destination_land = function(map_data, map_width, map_height, id){
    if (id != 0){
	    this.hilight_land(map_data, map_width, map_height, id, document.getElementById("canvas_hilight_destination"), 0.9);
    }
};

/**
* Remove origin land hilight
**/
MapCanvas.prototype.unhilight_origin_land = function(){
	var canvas = document.getElementById("canvas_hilight_origin");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
* Remove destination land hilight
**/
MapCanvas.prototype.unhilight_destination_land = function(){
	var canvas = document.getElementById("canvas_hilight_destination");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};






