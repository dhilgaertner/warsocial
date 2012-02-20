
function Seats(numberOfSeats) {
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
}

Seats.prototype.sit = function(player) {
	var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player == null) {
			ctx.occupySeat(key, player);
			return false;
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