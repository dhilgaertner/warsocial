
function Land(group) {
    this.shape = null;

    this.init(group);
}

Land.prototype.init = function( group ) {

    var land = new Kinetic.Polygon({
        points: [
            x + 4, y + 0,
            x + 16, y + 0,
            x + 20, y + 6,
            x + 16, y + 12,
            x + 4, y + 12,
            x + 0, y + 6],
        fill: color,
        stroke: 'black',
        strokeWidth: .1,
        lineJoin: 'bevel'/*,
         shadowColor: 'red',
         shadowBlur: 10,
         shadowOffset: 5,
         shadowOpacity: 0.5*/
    });

    this.shape = land;
};
