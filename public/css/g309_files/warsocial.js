/**
 * War social main game class
 */
function WarSocial() {
    var userId = -1; // UserID if user is a player
    var current_player_id = -1;
    var playerList = [];
    var map = null;
    var canInteract = false; // Indicate if User can play now

    var attack_from = undefined; // Land id of the land User is going to attack
    var attack_to = undefined; // Land id of the land User wants to attack

    this.getPlayerList = function() { return playerList; };
    this.getCurrentPlayerId = function() { return current_player_id; };
    this.setCurrentPlayerId = function( id ) { current_player_id = (id != undefined && id.constructor === Number)? id : -1;  };
    this.getMap = function () { return map; };
    this.getCanInteract = function() { return canInteract; };
    this.setCanInteract = function(bool) { canInteract = (bool != undefined && bool.constructor === Boolean)? bool : false;  };
    this.getUserId = function() { return userId; };
    this.setUserId = function(id) { userId = id };


    this.setAttackFrom = function( land_id ) { if ( land_id == undefined || this.getMap().find_land_by_id(land_id) != null)  attack_from = land_id };
    this.getAttackFrom = function() { return attack_from; };
    this.setAttackTo = function( land_id ) { if ( land_id == undefined || this.getMap().find_land_by_id(land_id) != null)  attack_to = land_id };
    this.getAttackTo = function() { return attack_to; };

    // Object creation

    this.create_map = function(map_layout) {
        map = new Map(map_layout.width, map_layout.height, map_layout.land_id_tiles);
    };

    this.create_playerList = function(player_list, who_am_i) {
        playerList = [];
        for (var p in player_list) {
            if (player_list[p] != null && player_list[p] != undefined && player_list[p].player_id != undefined && player_list[p].player_id.constructor === Number) {
                var isUser = false;
                if (who_am_i.constructor === Number && player_list[p].player_id == who_am_i) {
                    isUser = true;
                    userId = who_am_i;
                }
                playerList.push(new Player(player_list[p].player_id, isUser, player_list[p].color));
                if (player_list[p].is_turn) this.nextTurn(player_list[p].player_id);
            }
        }
    }
}

/**
 * Initialize game object.
 * @param info Object containing 4 parts : "who_am_i":int (fac.), "map_layout" : Object, "players":Array of Objects and "deployment":Array of Objects
 */
WarSocial.prototype.init = function( info ) {
    this.create_map(info.map_layout);
    this.create_playerList(info.players, info.who_am_i);
    this.deploy(info.deployment);
    for (var i = 0; i< info.players.length; i++) {
        if (info.players[i].is_turn) this.nextTurn(info.players[i].player_id);
    }
    this.addMouseListener();
};

/**
 * Add a mouseListener on the main canvas provided by MapCanvas class.
 */
WarSocial.prototype.addMouseListener = function() {
    //var canvas = this.getMap().getMapCanvas().getTopLayerCanvas();
    var canvas = $('#stage');
    if (canvas != null && canvas != undefined && !this.getCanInteract()) {
        canvas.bind("click", this.clickOnCanvas);
        this.setCanInteract(true);
    }
};

WarSocial.prototype.removeMouseListener = function() {
    //var canvas = this.getMap().getMapCanvas().getTopLayerCanvas();
    var canvas = $('#stage');
    if (canvas != null && canvas != undefined && this.getCanInteract()) {
        canvas.unbind("click");
        this.setCanInteract(false);
    }
};

/**
 * EventListener created by addMouseListener method.
 * Get the ref back to the game throught a GLOBAL variable :(
 * @param event
 */
WarSocial.prototype.clickOnCanvas = function (event) {
    var maincanvas = $('#stage');

    if (maincanvas != null && maincanvas != undefined) {
       var x = event.pageX - $(this).offset().left;
	   var y = event.pageY - $(this).offset().top;
    }
    // go back to the game scope
    if (game != null) {
        game.userClicksOnLand(x,y);
    }
};

/**
 * called by clickonCanvas if selection is valid
 */
WarSocial.prototype.userClicksOnLand = function( x, y ) {
    if (this.getUserId() != -1 && this.getAttackTo() == undefined && this.getUserId() == this.getCurrentPlayerId()) {
        var coords = this.getMap().getMapCanvas().getTileIndexFromCoords(x,y);

        var land_id = this.getMap().getLandByCoords(coords[0], coords[1]);
        var land = this.getMap().find_land_by_id(land_id);
        var land_owner = (land != null && land.getOwner() != null)? land.getOwner() : null;

        var attack_from = this.getAttackFrom();
        var attack_to = this.getAttackTo();

        if (land == null) {
            // user clicked outside the map. Ignore.
        } else if (attack_from == undefined && land != null && land_owner != null && land_owner.getId() != this.getUserId()) {
           // user clicked on someone else land as an attack land. Ignore.
        } else if (attack_from == undefined && land != null && land_owner != null && land_owner.getId() == this.getUserId() && land.getTroops() <= 1) {
            alert("You can attack with only one troop on this land");
        } else if (attack_from == undefined && land != null && land_owner != null && land_owner.getId() == this.getUserId()) {
             this.getMap().select(land_id, true);
             this.setAttackFrom(land_id);
        } else if (attack_from != undefined && attack_from == land_id) {
            this.getMap().unselect( true ); // true because this land is the origin
            this.setAttackFrom(undefined);
        } else if (attack_from != undefined && land_owner == this.getMap().find_land_by_id(attack_from).getOwner() && attack_to == undefined) {
            this.getMap().unselect( true ); // true because this land is the origin
            this.getMap().select(land_id, true);
            this.setAttackFrom(land_id);
        } else if ( attack_from != undefined && attack_to == undefined) { // land is destination and should be valid before being sent
            // check if it's a neighbour of origin land
            if (land != null) {
                if (!land.isAdjacentTo( attack_from)) {
                    alert("You can only attack neighbouring lands.");
                } else {
                    this.setAttackTo(land_id);
                    this.getMap().select(land_id, false);
                    this.request_attack();
                }
            }
        }
    }
};

WarSocial.prototype.request_attack = function() {
    attack_out(this.getAttackFrom(),this.getAttackTo());
};

WarSocial.prototype.attack = function( info ) {
    this.removeMouseListener();
    // show dice box
    var attacker = this.getMap().find_land_by_id(info.attack_info.attacker_land_id).getOwner();
    var defender = this.getMap().find_land_by_id(info.attack_info.defender_land_id).getOwner();
    var attacker_id = 0;
    var defender_id = 0;

    if (attacker != null){ attacker_id = attacker.getId(); }
    if (defender != null){ defender_id = defender.getId(); }
    this.getMap().getMapCanvas().show_dice_box(info.attack_info.attacker_roll, info.attack_info.defender_roll, attacker_id, defender_id);

    var this_scope = this;
    setTimeout(function() {this_scope.deploy(info.deployment_changes);}, 500);   // delay before calling deployment
};

/**
 * Modify land ownership and troop numbers
 * @param deployment Object list from json. Each object contains "deployment":int (number of troops), "player_id" : int and land_id : int
 */
WarSocial.prototype.deploy = function( deployment) {
    var m = this.getMap();

    for (var d in deployment) {

        if (deployment[d].deployment != undefined && deployment[d].deployment.constructor === Number && deployment[d].land_id != undefined && deployment[d].land_id.constructor === Number) {
            var p = this.find_by_player_by_id(deployment[d].player_id);
            m.claim(deployment[d].land_id, p, deployment[d].deployment);
        }
    }
    this.clear_all();
    m.drawcanvas();
};

/**
 * Change current player id if param is valid.
 * @param player_id integer representing player id
 */
WarSocial.prototype.nextTurn = function( player_id ) {
    if (player_id != undefined && player_id.constructor === Number) {
        this.removeMouseListener();
        this.setCurrentPlayerId(player_id);

        // DEMO : TO BE REMOVED !!
        this.setUserId( player_id );

        //alert("nextTurn : " + this.getCurrentPlayerId() + " playerId = " + this.getUserId() + " can interact : " + this.getCanInteract());
        this.addMouseListener();
    }
};


WarSocial.prototype.playerQuit = function( player_id ) {
      var p = this.find_by_player_by_id(player_id);
      // If the player exists, free the land
      if (p != null) {
          var l = this.getMap().find_lands_by_player_id(player_id);
          for (var i = 0; i < l.length; i++) {
              l[i].setOwner(null);
          }
      }
      // and remove the player
      this.removePlayer(player_id);
      // update the map
      this.deploy(null);
};

/**
 * Find a Player Object in playerList by player id.
 * @param player_id integer
 */
WarSocial.prototype.find_by_player_by_id = function( player_id ) {
    if (player_id != undefined && player_id.constructor === Number ) {
        var index = 0;
        var plist = this.getPlayerList();
        while (index < plist.length) {
            if (plist[index].getId() == player_id) return plist[index];
            index++;
        }
    }
    return null;
};

/**
 * Remove Player with requested player id.
 * @param player_id Player ID of the
 */
WarSocial.prototype.removePlayer = function( player_id ) {
    var index = 0;
    var plist = this.getPlayerList();
    while (index < plist.length) {
        if (plist[index].getId() == player_id) {
            plist.splice(index, 1);
            return;
        }
        index++;
    }
};

/**
 * TO BE COMPLETED
 */
WarSocial.prototype.clear_all = function() {
    this.getMap().getMapCanvas().clear_all();
    this.getMap().unselect(true);
    this.getMap().unselect(false);
    this.setAttackFrom(undefined);
    this.setAttackTo(undefined);
    this.removeMouseListener();
    this.setUserId(-1);
    this.setCurrentPlayerId(-1);
};

