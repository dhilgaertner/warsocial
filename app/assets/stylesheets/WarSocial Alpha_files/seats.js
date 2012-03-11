
function Seats(numberOfSeats, players) {
  var ctx = this;
	this._seats = new Object();
	
	for (i = 0;i < numberOfSeats;i++) {
        var s = $('#game_seat_' + i.toString());
		this._seats[i.toString()] = { player: null, seat: s, timer: new TurnTimer(s, 20) };
	}

	this.occupySeat = function(key, player) {
		var item = ctx._seats[key];
		
		item.player = player;
		$(item.seat).find('.name').html(player.name);
		
		$(item.seat).show();
	};
	
	this.emptySeat = function(key) {
		var item = ctx._seats[key];
		
		item.player = null;
		$(item.seat).find('.name').html("");
        $(item.seat).find('.turn_progress').hide();
		$(item.seat).hide();
	};
	
	if (players != null) {
		for (i = 0;i < players.length;i++) {
			player = players[i];
			if (player.state != "dead") {
				this.occupySeat((player.seat_id - 1).toString(), player);
			}
		}
	}
}

Seats.prototype.clear = function() {
	var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player != null) {
			ctx.emptySeat(key);
		}
	});
};

Seats.prototype.sit = function(player) {
	var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player == null) {
			ctx.occupySeat(key, player);
			return false; // Returning false get's you out of the $.each()
		}
	});
};

Seats.prototype.turn_start = function(player_thin) {
	var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player != null && occupant.player.player_id == player_thin.player_id) {
			occupant.seat.find(".turn_progress").show();
            occupant.timer.restart();
		} else {
			occupant.seat.find(".turn_progress").hide();
		}
	});
};

Seats.prototype.turn_timer_restart = function(player_thin) {
    var ctx = this;
    $.each(this._seats, function(key, occupant) {
        if (occupant.player != null && occupant.player.player_id == player_thin.player_id) {
            occupant.timer.restart();
        }
    });
};

Seats.prototype.stand = function(player) {
	var ctx = this;
	$.each(this._seats, function(key, occupant) {
		if (occupant.player != null) {
			if (occupant.player.player_id == player.player_id) {
				ctx.emptySeat(key);
			}
		}
	});
};
