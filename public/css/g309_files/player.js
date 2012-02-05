/*
 * Player Class
 */

function Player(id, isUser, color ) {



    if (id == undefined) id = -1;
    if (isUser == undefined) isUser = false;
    if (color == undefined) color="CCCCCC";

    this.getId = function() { return id; };
    this.isUser = function() { return isUser; };
    this.getColor = function() { return color; };

}

Player.prototype.toString = function() {
    return ("[Player]");
};


