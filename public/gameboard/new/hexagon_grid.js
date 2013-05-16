
function HexagonGrid() {
    this.hexs = [];
    this.grid = [];
    this.groups = {};
    this.map_layout = null;
}

HexagonGrid.prototype.init = function( map_layout ) {
    this.map_layout = map_layout;
    var i = 0;
    var colorHash = { 0: map_layout.neutral_land_color};

    for (var row=0; row<map_layout.height; row++)
    {
        this.grid.push([]);

        for (var col=0; col<map_layout.width; col++)
        {
            var y = 12 * row;
            if (col % 2 == 1){	y += 6;	}	// offset y position by half a row for odd columns

            var land_id = map_layout.land_id_tiles[i];

            if (colorHash[land_id] == null){
                colorHash[land_id] = '#'+Math.floor(Math.random()*16777215).toString(16);
            }

            var color = colorHash[land_id];
            var hex = new Hexagon(col * 16, y + 30, color);

            hex.row = row;
            hex.col = col;
            hex.shape.row = row;
            hex.shape.col = col;
            hex.land_id = land_id;

            this.grid[row].push(hex);
            this.hexs.push(hex);

            if (this.groups[land_id] == null) this.groups[land_id] = [];
            this.groups[land_id].push(hex);

            i++;
        }
    }
};

HexagonGrid.prototype.find_surrounding_hexs = function( hex ) {
    var ctx = this;

    function find_top_hex(row, col) {
        if (row == 0) return null;

        return ctx.grid[row-1][col];
    }

    function find_bottom_hex(row, col) {
        if (row == ctx.map_layout.height - 1) return null;

        return ctx.grid[row+1][col];
    }

    function find_upper_left_hex(row, col) {
        if (col == 0) return null;
        if (col % 2 == 0 && row == 0) return null;

        if (col % 2 == 0){
            return ctx.grid[row-1][col-1];
        } else {
            return ctx.grid[row][col-1];
        }
    }

    function find_upper_right_hex(row, col) {
        if (col == ctx.map_layout.width - 1) return null;
        if (col % 2 == 0 && row == 0) return null;

        if (col % 2 == 0){
            return ctx.grid[row-1][col+1];
        } else {
            return ctx.grid[row][col+1];
        }
    }

    function find_lower_left_hex(row, col) {
        if (col == 0) return null;
        if (col % 2 != 0 && row == ctx.map_layout.height - 1) return null;

        if (col % 2 == 0){
            return ctx.grid[row][col-1];
        } else {
            return ctx.grid[row+1][col-1];
        }
    }

    function find_lower_right_hex(row, col) {
        if (col == ctx.map_layout.width - 1) return null;
        if (col % 2 != 0 && row == ctx.map_layout.height - 1) return null;

        if (col % 2 == 0){
            return ctx.grid[row][col+1];
        } else {
            return ctx.grid[row+1][col+1];
        }
    }

    var temp = [];

    temp.push(find_top_hex(hex.row, hex.col));
    temp.push(find_bottom_hex(hex.row, hex.col));
    temp.push(find_upper_left_hex(hex.row, hex.col));
    temp.push(find_upper_right_hex(hex.row, hex.col));
    temp.push(find_lower_left_hex(hex.row, hex.col));
    temp.push(find_lower_right_hex(hex.row, hex.col));

    var found = [];
    for (var i=0; i<temp.length; i++)
    {
        var x = temp[i];

        if (x != null) found.push(x);
    }

    return found;
};