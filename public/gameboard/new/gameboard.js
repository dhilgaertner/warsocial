/**
 * War social main game class
 */
function WarSocial() {
    this.stage = new Kinetic.Stage({
        container: 'stage',
        width: 600,
        height: 420
    });
}

WarSocial.prototype.init = function( info ) {
    var layer = new Kinetic.Layer();

    var ctx = this;

    this.hexagonGrid = new HexagonGrid();
    this.hexagonGrid.init(info.map_layout);

    for (var i=0; i<this.hexagonGrid.hexs.length; i++) {
        var hex = this.hexagonGrid.hexs[i];

        hex.shape.on('mouseover', function() {
            this.setAttrs({
                fill: 'green'
            });

            var surrounding_hexs = ctx.hexagonGrid.find_surrounding_hexs(this);

            for (var y=0; y<surrounding_hexs.length; y++) {
                surrounding_hexs[y].shape.setAttrs({
                    fill: 'yellow'
                });

                surrounding_hexs[y].shape.draw();
            }

            this.draw();
        });

        hex.shape.on('mouseout', function() {
            this.setAttrs({
                fill: '#00D2FF'
            });

            var surrounding_hexs = ctx.hexagonGrid.find_surrounding_hexs(this);

            for (var y=0; y<surrounding_hexs.length; y++) {
                surrounding_hexs[y].shape.setAttrs({
                    fill: '#00D2FF'
                });

                surrounding_hexs[y].shape.draw();
            }

            this.draw();
        });

        hex.shape.on('click', function() {
            layer.draw();
        });

        layer.add(hex.shape);
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