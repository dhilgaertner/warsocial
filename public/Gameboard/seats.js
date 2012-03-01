
function Seats(numberOfSeats, players) {
  var ctx = this;
	this._seats = new Object();
	
	for (i = 0;i < numberOfSeats;i++) {
		this._seats[i.toString()] = { player: null, seat: $('#game_seat_' + i.toString()) };
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
			return true;
		}
	});
};

Seats.prototype.turn_start = function(player_thin) {
	var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player.id == player_thin.id) {
			occupant.seat.find(".turn_progress").show();
		} else {
			occupant.seat.find(".turn_progress").hide();
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