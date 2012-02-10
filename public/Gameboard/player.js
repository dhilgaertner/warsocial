/*
 * Player Class
 */

function Player(a_id, a_isUser, a_color, a_seat ) {

    var id = (a_id == undefined)? -1 : a_id;
    var user = (a_isUser == undefined)? false : a_isUser;
    var color = (a_color == undefined)? "CCCCCC" : a_color;
    var seat_id = (a_seat == undefined)? 0 : a_seat;

    this.getId = function() { return id; };
    this.isUser = function() { return user; };
    this.getColor = function() { return color; };
    this.getSeatId = function() { return seat_id; };
}

Player.prototype.toString = function() {
    return ("[Player]");
};


