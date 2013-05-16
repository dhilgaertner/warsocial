
function Land(group, hexGrid) {
    this.shape = null;

    this.init(group, hexGrid);
}

Land.prototype.init = function(group, hexGrid) {

    var borders = findBorderPieces(group, hexGrid);

    for(var key in borders) {
        var border = borders[key];
        border.shape.setAttrs({
            strokeWidth: 1
        });
        border.shape.draw();
    }

    var land = new Kinetic.Polygon({
        points: [
            4, 0,
            16, 0,
            20, 6,
            16, 12,
            4, 12,
            0, 6],
        fill: 'red',
        stroke: 'black',
        strokeWidth: .1,
        lineJoin: 'bevel'/*,
         shadowColor: 'red',
         shadowBlur: 10,
         shadowOffset: 5,
         shadowOpacity: 0.5*/
    });

    this.shape = land;

    function findBorderPieces(group, hexGrid){
        var borders = [];
        for (var key in group) {
            var hex = group[key];
            var surround = hexGrid.find_surrounding_hexs(hex);
            for(var skey in surround) {
                if (hex.land_id != surround[skey].land_id) {
                    borders.push(hex);
                    break;
                }
            }
        }
        return borders;
    }
};
