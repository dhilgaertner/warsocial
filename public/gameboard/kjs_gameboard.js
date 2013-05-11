/**
 * War social main game class
 */
function WarSocial() {
    this.stage = new Kinetic.Stage({
        container: 'stage',
        width: 600,
        height: 420
    });
    this.hex_grid = [];
}

WarSocial.prototype.init = function( info ) {
    var layer = new Kinetic.Layer();

    function CreateHexagon(row, col) {
        var radius = 5;
        var border_width = 0;
        var both = radius + border_width;
        var rowindent = (row % 2) * (both + both/2);

        var hex = new Kinetic.RegularPolygon({
            x: both + (col * both * 3) + rowindent,
            y: both + (row * both) - (row * (radius / 7)),
            sides: 6,
            radius: radius,
            fill: '#00D2FF',
            //stroke: 'black',
            //strokeWidth: border_width,
            rotationDeg: 90
        });

        return hex;
    }

    for (var row=0;row<info.map_layout.height;row++)
    {
        this.hex_grid.push([]);

        for (var col=0;col<info.map_layout.width;col++)
        {
            var poly = CreateHexagon(row, col);

            layer.add(poly);

            this.hex_grid[row].push(poly);
        }
    }

    // add the layer to the stage
    this.stage.add(layer);
};

WarSocial.prototype.attack = function( info ) {

};

WarSocial.prototype.deploy = function( deployment, animation) {

};

WarSocial.prototype.nextTurn = function( player_id ) {

};


WarSocial.prototype.playerQuit = function( player_id ) {

};

WarSocial.prototype.removePlayer = function( player_id ) {

};

WarSocial.prototype.reset = function () {

};

WarSocial.prototype.clear_all = function() {

};

WarSocial.prototype.toggle_dice = function(isVisible) {

};

WarSocial.prototype.toggle_sounds = function(isOn) {

};