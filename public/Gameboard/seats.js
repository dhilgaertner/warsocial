
function Seats(numberOfSeats) {
  var _seats = new Object();
	
	for (i = 0;i < numberOfSeats;i++) {
		_seats[i.toString()] = { player: null, seat: $('#game_seat_' + i.toString()) };
	}
	
	this.occupySeat = function(key, player) {
		
	};
	
	this.emptySeat = function(key) {
		
	};
}

Seats.prototype.sit = function(player) {
  $.each(_seats, function(key, occupant) { 
		if (occupant == null) {
			this.occupySeat(key, player);
		}
	});
};

Seats.prototype.stand = function(player) {
	$.each(_seats, function(key, occupant) {
		if (occupant.player_id == player.player_id) {
			this.emptySeat(key);
		}
	});
};