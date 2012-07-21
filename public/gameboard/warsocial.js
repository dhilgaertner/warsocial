/**
 * War social main game class
 */
function WarSocial() {
    var userId = -1; // UserID if user is a player
    var current_player_id = -1;
    var playerList = [];
    var map = null;
    var canInteract = false; // Indicate if User can play now
    var dicebox = null; // DiceBox to show attack result

    var attack_from = undefined; // Land id of the land User is going to attack
    var attack_to = undefined; // Land id of the land User wants to attack

    this.getPlayerList = function() { return playerList; };
    this.getCurrentPlayerId = function() { return current_player_id; };
    this.setCurrentPlayerId = function( id ) { current_player_id = (id != undefined)? id : -1;  };
    this.getMap = function () { return map; };
    this.getCanInteract = function() { return canInteract; };
    this.setCanInteract = function(bool) { canInteract = (bool != undefined && bool.constructor === Boolean)? bool : false;  };
    this.getUserId = function() { return userId; };
    this.setUserId = function(id) { userId = id };
    this.getDiceBox = function() { return dicebox; };

    this.setAttackFrom = function( land_id ) { if ( land_id == undefined || this.getMap().find_land_by_id(land_id) != null)  attack_from = land_id };
    this.getAttackFrom = function() { return attack_from; };
    this.setAttackTo = function( land_id ) { if ( land_id == undefined || this.getMap().find_land_by_id(land_id) != null)  attack_to = land_id };
    this.getAttackTo = function() { return attack_to; };

    // Object creation

    dicebox = new DiceBox();

    this.create_map = function(map_layout) {
        map = new Map(map_layout.width, map_layout.height, map_layout.land_id_tiles);
    };

    this.create_playerList = function(player_list, who_am_i) {
        playerList = [];
        for (var p in player_list) {
            if (player_list[p] != null && player_list[p] != undefined && player_list[p].player_id != undefined) {
                var user = false;
                if (who_am_i != undefined && player_list[p].player_id == who_am_i) {
                    user = true;
                }
                var seatid = (player_list[p].seat_id == undefined)? player_list[p].player_id : player_list[p].seat_id;
                playerList.push(new Player(player_list[p].player_id, user, player_list[p].color, seatid));
                console.log("playerList : " + playerList[playerList.length-1].getSeatId());
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
    this.reset();
    this.create_map(info.map_layout);
    this.setUserId(info.who_am_i);
    this.create_playerList(info.players, info.who_am_i);
    this.deploy(info.deployment);
    for (var i = 0; i< info.players.length; i++) {
        if (info.players[i].is_turn) this.nextTurn(info.players[i].player_id);
    }
    this.addMouseListener();
		SoundManager.init();
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
 * Get the ref back to the game throught the "game" global variable
 * @param event this = object triggering the event
 */
WarSocial.prototype.clickOnCanvas = function (event) {
    
    var maincanvas = $('#stage');

    if (maincanvas != null && maincanvas != undefined) {
       var x = event.pageX - $(this).offset().left;
	   var y = event.pageY - $(this).offset().top;
    }
    //alert("Click on Canvas : " + x + ", " + y);    
    // go back to the game scope
    if (game != null) {
        game.userClicksOnLand(x,y);
    }
};

/**
 * Called by clickonCanvas if selection is valid.
 * Select / unselect land, and trigger an attack if two lands are selected.
 * @param x X coord of the mouse click
 * @param y Y coord of the mouse click
 */
WarSocial.prototype.userClicksOnLand = function( x, y ) {
    //alert("Click on LAND : " + x + ", " + y);  
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
            // You can attack with only one troop on this land
        } else if (attack_from == undefined && land != null && land_owner != null && land_owner.getId() == this.getUserId()) {
             this.getMap().select(land_id, true);
             this.setAttackFrom(land_id);
        } else if (attack_from != undefined && attack_from == land_id) {
            this.getMap().unselect( true ); // true because this land is the origin
            this.setAttackFrom(undefined);
        } else if (attack_from != undefined && attack_to == undefined && land_owner == this.getMap().find_land_by_id(attack_from).getOwner() ) {
            if (land.getTroops() > 1) { // if the land has more than ONE troop
                this.getMap().unselect( true ); // true because this land is the origin
                this.getMap().select(land_id, true);
                this.setAttackFrom(land_id);
            } else {
                // do nothing, you can't attack from a land that has less than 2 troops on it
            }
        } else if ( attack_from != undefined && attack_to == undefined) { // land is destination and should be valid before being sent
            // check if it's a neighbour of origin land
            if (land != null) {
                if (!land.isAdjacentTo( attack_from)) {
                    // alert("You can only attack neighbouring lands.");
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
    SoundManager.play("roll");
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
    var this_scope = this;
    // make the graphical selection if the user is not the attacker
    if (attacker_id != this.getUserId()) {
        this.getMap().select(info.attack_info.attacker_land_id, true); // instantaneous selection of the origin land
        setTimeout(function() {this_scope.getMap().select(info.attack_info.defender_land_id, false);}, 200); // selection of the destination within 200millisec
    }

    var dicebox = this.getDiceBox();
    if (dicebox != null && defender != null) {
		dicebox.show_dice_box(info.attack_info.attacker_roll, info.attack_info.defender_roll, attacker.getSeatId(), defender.getSeatId());
	}
	else if (dicebox != null) {
		dicebox.show_dice_box(info.attack_info.attacker_roll, info.attack_info.defender_roll, attacker.getSeatId(), 0);	// defender is neutral (id 0)
	}
    //this.getMap().getMapCanvas().show_dice_box(info.attack_info.attacker_roll, info.attack_info.defender_roll, attacker_id, defender_id);
    setTimeout(function() {this_scope.deploy(info.deployment_changes, false);}, 400);   // delay before calling deployment

    var att_total = 0;
    $.each(info.attack_info.attacker_roll,function() {
        att_total += this;
    });

    var def_total = 0;
    $.each(info.attack_info.defender_roll,function() {
        def_total += this;
    });

    if (att_total > def_total) {
        SoundManager.play("win_roll");
    } else {
        SoundManager.play("loss_roll");
    }
};

/**
 * Modify land ownership and troop numbers
 * @param deployment Object list from json. Each object contains "deployment":int (number of troops), "player_id" : int and land_id : int
 */
WarSocial.prototype.deploy = function( deployment, animation) {
    if (animation == undefined) animation = true;
    var m = this.getMap();

    for (var d in deployment) {

        if (deployment[d].deployment != undefined && deployment[d].deployment.constructor === Number && deployment[d].land_id != undefined && deployment[d].land_id.constructor === Number) {
            var p = this.find_by_player_by_id(deployment[d].player_id);
            m.claim(deployment[d].land_id, p, deployment[d].deployment);
        }
    }
    this.clear_all();
    m.drawcanvas(animation);
    next_turn(this.getCurrentPlayerId()); // Allow the player to play again if it's still its turn
};

/**
 * Change current player id if param is valid.
 * @param player_id integer representing player id
 */
WarSocial.prototype.nextTurn = function( player_id ) {
    if (player_id != undefined) {
        this.removeMouseListener();
        this.setCurrentPlayerId(player_id);

	var m = this.getMap();
	m.hilight_player_lands(player_id);

        // DEMO : TO BE REMOVED !!
        //this.setUserId( player_id );

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
    if (player_id != undefined ) {
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

WarSocial.prototype.reset = function () {
    if (this.getMap() != null && this.getMap() != undefined) {
        this.getMap().getMapCanvas().eraseMap();
        this.clear_all();
    }
    this.removeMouseListener();
    this.setUserId(-1);
    this.setCurrentPlayerId(-1);
};

WarSocial.prototype.clear_all = function() {
    this.getMap().getMapCanvas().clear_all();
    this.getMap().unselect(true);
    this.getMap().unselect(false);
    this.setAttackFrom(undefined);
    this.setAttackTo(undefined);

};

WarSocial.prototype.toggle_dice = function(isVisible) {
   $('#dice_container').toggle(isVisible);
};

WarSocial.prototype.toggle_sounds = function(isOn) {
    SoundManager.soundsToggle(isOn);
};