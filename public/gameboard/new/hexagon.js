
function Hexagon(x, y, color) {
    this.shape = null;

    this.init(x, y, color);
}

Hexagon.prototype.init = function(x, y, color) {

    var hex = new Kinetic.Polygon({
        points: [
            x + 4, y + 0,
            x + 16, y + 0,
            x + 20, y + 6,
            x + 16, y + 12,
            x + 4, y + 12,
            x + 0, y + 6],
        fill: color,
        stroke: 'black',
        strokeWidth: 0,
        lineJoin: 'bevel'
        //shadowColor: 'red',
        //shadowBlur: 10,
        //shadowOffset: 5,
        //shadowOpacity: 0.5
    });

    this.shape = hex;
};