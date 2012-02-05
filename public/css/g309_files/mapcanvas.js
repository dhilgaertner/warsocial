/**
 * Class from Mapdrawer
 */

function MapCanvas() {

    // CANVAS NAMES SHOULD BE PUT INTO CONSTANTS
    var SHAPE_WIDTH = 28;			  // width of the hexagon shape (larger than one column)
    var shape_points_x = [4, 16, 20, 16, 4, 0, 4];		// x coordinates of the hexagon shape
    var shape_points_y = [0, 0, 6, 12, 12, 6, 0];			// y coordinates of the hexagon shape
    var canvas_margin = 20;		// margin of the canvas to offset all coordinates
    var row_height = 12;			// height of one row of hexagons
    var col_width = 16;				// width of one column of hexagons
    var player_colour_fill = ["#CCCCCC", "#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac", "#814f2e"];
    var player_colour_stroke = ["#CCCCCC", "#ffcc00", "#296dff", "#ed1a1a", "#86ce28", "#7743ec", "#2bb9dd", "#ca43ec", "#a26136"];

    this.getColWidth = function() { return col_width; };
    this.getRowHeight = function() { return row_height; };
    this.getCanvasMargin = function() { return canvas_margin; };
    this.getShapePointX = function() { return shape_points_x; };
    this.getShapePointY = function() { return shape_points_y; };
    this.getShapeWidth = function() { return SHAPE_WIDTH; };

    this.getTopLayerCanvas = function() { return document.getElementById("canvas_dice"); };

    // Careful, this player color stroke will be dynamic and might change
    this.getPlayerColourFill = function() { return player_colour_fill; };
    this.getPlayerColourStroke = function() { return player_colour_stroke; };
}

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
	ctx.shadowBlur    = 15;
	ctx.shadowColor   = "rgba(0,0,0,0.4)";

	for (r=0; r<map_height; r++){
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
	}
};

/**
*	Draw texture
* - draw entire shape of the map and apply the pattern to it
**/
MapCanvas.prototype.draw_texture = function(map_data, map_width, map_height, canvas, img) {
	var ctx=canvas.getContext("2d");
	var r, c;
    var pattern_fill=ctx.createPattern(img,"repeat");

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

MapCanvas.prototype.clear_all = function() {
    var canvas = document.getElementById("canvas_map");
    if (canvas != null) {
        var ctx=canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height);
        canvas = document.getElementById("canvas_shadow");
        ctx=canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height);
    }
};

MapCanvas.prototype.draw_canvas = function(land_id_tiles, map_width, map_height, land_owner, land_troops){
	this.draw_tiles(land_id_tiles, map_width, map_height, land_owner, document.getElementById("canvas_map"));
	this.draw_shadow(land_id_tiles, map_width, map_height, document.getElementById("canvas_shadow"));
	this.draw_texture(land_id_tiles, map_width, map_height, document.getElementById("canvas_map"), document.getElementById("pattern"));
    this.add_dice(land_id_tiles, map_width, map_height, land_troops);
};

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
MapCanvas.prototype.add_dice = function(map_data, map_width, map_height, deployment){
	var DICE_HEIGHT_MAX = 4;
	var DICE_HEIGHT_OFFSET = 11;
  var DICE_WIDTH_X_OFFSET = 13;
	var DICE_WIDTH_Y_OFFSET = 7;	
  var canvas = document.getElementById("canvas_dice");
	var ctx = canvas.getContext("2d");
	var r, c, i;

	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// look at the map and draw dice
	for (r=0; r<map_height; r++){
		for (c=0; c<map_width; c++){

			// add dice if land it is not 0 and there are dices in the land
			var current_tile_id = map_data[r*map_width + c];		// map id of the current tile
			if ((current_tile_id != 0) && (deployment[current_tile_id] > 0)){
				// get centre
				var centre_row_col = this.get_centre_row_col(map_data, map_width, map_height, current_tile_id);
				var	x = this.get_x_from_col(centre_row_col[1]);
				var y = this.get_y_from_row_col(centre_row_col[0], centre_row_col[1]);
				var num_of_dice = deployment[current_tile_id];

				// add each dice
				for (i=0; i<num_of_dice; i++){
					var dice_value = Math.floor((current_tile_id+i)%6 + 1); // assign a dice value based on the land id and the position of the dice (this is purely graphical so that there isn't the same pattern on all the dices on the entire map)
					var dice_column = Math.floor(i / DICE_HEIGHT_MAX);
					var dice_row = i % DICE_HEIGHT_MAX;
					var shadow = false;

					// draw shadow if first dice in the column (dice is in the first row
					if (dice_row == 0){
						shadow = true;
					}
					this.draw_dice(x+(DICE_WIDTH_X_OFFSET*dice_column), y-(DICE_HEIGHT_OFFSET*dice_row)+(DICE_WIDTH_Y_OFFSET*dice_column), dice_value, shadow, ctx);
				}
				// set deployment to 0, since we finished drawing the dice for this land id
				deployment[current_tile_id] = 0;
			}
		}
	}
};

/**
 * Remove the dice from display
 */
MapCanvas.prototype.clearDice = function() {
    var canvas = document.getElementById("canvas_dice");
	var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
* Draw the dice graphics at a specific spot on the canvas
**/
MapCanvas.prototype.draw_dice = function(x, y, value, has_shadow, context){
	var DICE_IMG_ID = "dice";
	var DICE_SHADOW_ID = "dice_shadow";
	var IMG_OFFSET_X = 4;
	var IMG_OFFSET_Y = -6;
	var SHADOW_OFFSET_X = IMG_OFFSET_X-2;
	var SHADOW_OFFSET_Y = IMG_OFFSET_Y+4;

	var img = document.getElementById(DICE_IMG_ID+ value);

	if (has_shadow){
		var img_shadow = document.getElementById(DICE_SHADOW_ID);
		context.drawImage(img_shadow, x+SHADOW_OFFSET_X, y+SHADOW_OFFSET_Y);
	}
	context.drawImage(img, x+IMG_OFFSET_X, y+IMG_OFFSET_Y);
};

/**
 * HILIGHT
 */
MapCanvas.prototype.hilight_land = function(map_data, map_width, map_height, id, canvas){
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
	gradient.addColorStop(0.0,"rgba(255, 255, 255, 0.9)");
	gradient.addColorStop(1.0,"rgba(255, 255, 255, 0.5)");
	ctx.globalCompositeOperation="source-out";
	ctx.drawImage(canvas_mask, 0, 0);
	ctx.globalCompositeOperation="source-in";	// use source-in for the mask effect
	ctx.fillStyle = gradient;
	ctx.fillRect(min_x, min_y, max_x-min_x, max_y-min_y);
};


/**
* Hilight the origin land, given its id
**/
MapCanvas.prototype.hilight_origin_land = function(map_data, map_width, map_height, id){
    // hilight only if not an empty space (id = 0)
    if (id != 0){
	    this.hilight_land(map_data, map_width, map_height, id, document.getElementById("canvas_hilight_origin"));
    }
};

/**
* Hilight the destination land, given its id
**/
MapCanvas.prototype.hilight_destination_land = function(map_data, map_width, map_height, id){
    if (id != 0){
	    this.hilight_land(map_data, map_width, map_height, id, document.getElementById("canvas_hilight_destination"));
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

/**
* Draw dice box
**/
MapCanvas.prototype.draw_dice_box = function(x, y, width, height, corner, ctx){
	// draw box
	ctx.beginPath();
	ctx.moveTo(x + corner, y);
	ctx.lineTo(x + width - corner, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
	ctx.lineTo(x + width, y + height - corner);
	ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
	ctx.lineTo(x + corner, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
	ctx.lineTo(x, y + corner);
	ctx.quadraticCurveTo(x, y, x + corner, y);
	ctx.closePath();

	// put shadow
	ctx.shadowBlur = 10;
	ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
	ctx.fillStyle = "rgba(0, 0 ,0, 1.0)";
	ctx.fill();             // draw shadow shape
	ctx.globalCompositeOperation="xor";	// use xor to only get the shadow around the box
    ctx.shadowBlur = 0;     // remove shadow
	ctx.fill();             // draw shape to mask out previous shape, except for the shadow
	ctx.globalCompositeOperation="source-over"; // return to default

	// draw outline
	ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
	ctx.lineWidth = 4;
	ctx.stroke();

	// draw hilight line
	ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
	ctx.lineWidth = 2;
	ctx.stroke();

	// put gradient
    var gradient = ctx.createLinearGradient(x, y, x, y+height);
	gradient.addColorStop(1.0, "rgba(50, 50, 50, 0.95)");
	gradient.addColorStop(0.0, "rgba(100, 100, 100, 0.95)");
	ctx.fillStyle = gradient;
	ctx.fill();
};

/**
* Draw dice box with dice rolls
**/
MapCanvas.prototype.show_dice_box = function(attacker_roll, defender_roll, attacker_id, defender_id){
	var BOX_X = 280;          // x location of the box
	var BOX_Y = 330;          // y location of the box
	var BOX_HEIGHT = 75;
	var BOX_CORNER = 8;       // roundness of the box corner
	var DICE_X = 38;          // x location of the row of dice
	var DICE_Y = 18;          // y location of the row of dice
	var DICE_X_SPACE = 20;    // x spacing between each dice
	var DICE_Y_SPACE = 30;    // y spacing between each roll of dice
	var TEXT_X = 8;           // x location of the dice roll text
	var TEXT_Y = 31;          // y location of the dice roll text
	var TEXT_Y_SPACE = 31;    // y spacing between the dice roll text

	var box_width;     // width of the box, will calculate dynamically depending on the number of dice
	var canvas = document.getElementById("canvas_dice_box");
	var ctx = canvas.getContext('2d');
	var x, y, i;
	var sum1 = 0;      // sum of the dice rolls for player 1
	var sum2 = 0;      // sum of the dice rolls for player 2

    // clear
    this.clear_dice_box();
    
	// change box width depending on the number of dice
	if (attacker_roll.length > defender_roll.length){
		box_width = DICE_X + (DICE_X_SPACE * (attacker_roll.length+1));
	}
	else {
		box_width = DICE_X + (DICE_X_SPACE * (defender_roll.length+1));
	}

	// calculate x to centre the box
	x = BOX_X - box_width/2;
	y = BOX_Y;

	// draw box
	this.draw_dice_box(x, y, box_width, BOX_HEIGHT, BOX_CORNER, ctx);

    // draw content
	ctx.font="bold 24px Arial";

	// draw result attacker
	for (i=0; i<attacker_roll.length; i++){
		this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y, attacker_roll[i], true, ctx);
		sum1 += attacker_roll[i];
	}
	ctx.fillStyle = this.getPlayerColourStroke()[attacker_id];
	ctx.fillText(sum1, x + TEXT_X, y + TEXT_Y);

	// draw result defender
	for (i=0; i<defender_roll.length; i++){
		this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y + DICE_Y_SPACE, defender_roll[i], true, ctx);
		sum2 += defender_roll[i];
	}
	ctx.fillStyle = this.getPlayerColourStroke()[defender_id];
	ctx.fillText(sum2, x + TEXT_X, y + TEXT_Y + TEXT_Y_SPACE);

	// fade out loser (draw on top with black text)
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	if (sum1 > sum2){
		ctx.fillText(sum2, x + TEXT_X, y + TEXT_Y + TEXT_Y_SPACE);
	}
	else if (sum1 < sum2){
		ctx.fillText(sum1, x + TEXT_X, y + TEXT_Y);
	}

	//animate show
	$("#canvas_dice_box").css({top:'-20px', opacity:0.0});
	$("#canvas_dice_box").animate({top:0, opacity:1.0}, 500);

    // set timer to hide
    var this_scope = this;
    setTimeout(function() { this_scope.hide_dice_box(this_scope);}, 2000);
};

/**
* Hide dice box with animation
**/
MapCanvas.prototype.hide_dice_box = function(scope){
	$("#canvas_dice_box").animate({top:'-20px', opacity:0.0}, 500, scope.clear_dice_box);
};

/**
* Clear the canvas of the dice box
**/
MapCanvas.prototype.clear_dice_box = function(){
    var canvas = document.getElementById("canvas_dice_box");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};




