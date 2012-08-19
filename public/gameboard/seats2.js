
function Seats(who_am_i, numberOfSeats, players, is_started) {
    var ctx = this;
    this._seats = new Object();
    this.is_game_started = is_started;
    this.who_am_i = who_am_i;

    for (i = 0;i < numberOfSeats;i++) {
        var s = $('#game_seat_' + i.toString());
        this._seats[i.toString()] = { player: null, seat: s, timer: new TurnTimer(s, 20) };
    }

    this.occupySeat = function(key, player) {
        var item = ctx._seats[key];

        item.player = player;
        $(item.seat).find('.name').html(player.name);

        $(item.seat).find('.action-sit').hide();

        if(!ctx.is_game_started && player.name == who_am_i) {
            $(item.seat).find('.action-stand').show();
        }

        if (player.name == who_am_i) {
            $(item.seat).find('.avatar .action-endturn').show();

            if(ctx.is_game_started) {
                $("#game-forfeit").show();
            }
        }

        $(item.seat).show();
    };

    this.emptySeat = function(key) {
        var item = ctx._seats[key];

        item.player = null;
        $(item.seat).find('.name').html("");
        $(item.seat).find('.place').html("");
        $(item.seat).find('.points').html("");
        $(item.seat).find('.delta_points').html("");
        $(item.seat).find('.lands').html("");
        $(item.seat).find('.turn_progress').hide();

        $(item.seat).find('.action-sit').show();
        $(item.seat).find('.action-stand').hide();
    };

    if (players != null) {
        for (i = 0;i < players.length;i++) {
            player = players[i];
            if (player.state != "dead") {
                this.occupySeat((player.seat_id - 1).toString(), player);
            }
        }
    }

    if (!is_started) {
        var ctx = this;
        $.each(this._seats, function(key, occupant) {
            if (occupant.player == null) {
                $(ctx._seats[key].seat).find('.action-sit').show();
            }
        });
    }
}

Seats.prototype.clear = function() {
	var ctx = this;
    $.each(this._seats, function(key, occupant) {
        if (occupant.player != null) {
            $(occupant.seat).removeClass('dead');
            ctx.emptySeat(key);
        }
    });

    $('div.stats').hide();
    $('.action-sit').show();
    $('#game-forfeit').hide();
    this.is_game_started = false;

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

Seats.prototype.game_started = function() {
    var ctx = this;
    this.is_game_started = true;
    $.each(this._seats, function(key, s) {
        s.seat.find('.action-sit').hide();
        s.seat.find('.action-stand').hide();
        if (s.player != null && s.player.name == ctx.who_am_i) {
            $('#game-forfeit').hide();
        }
    });
};

Seats.prototype.update_player_data = function(players) {
    var ctx = this;
    $.each(players, function(index, player) {
        var i = player.seat_id - 1;
        var s = ctx._seats[i.toString()];
        var el = s.seat;

        if (player.state == "dead") {
            $(el).addClass('dead');
        } else {
            $(el).show();

            if (ctx.is_game_started) {
                $(el).find('div.stats').show();
            }
        }

        var points_string = player.delta_points.toString();

        if (player.delta_points != 0) {
            points_string = player.delta_points > 0 ? "+" + points_string : "-" + points_string;
        }

        convert_place_to_string = function(place) {
            switch(place)
            {
                case 1:
                    return "1st";
                case 2:
                    return "2nd";
                case 3:
                    return "3rd";
                case 4:
                    return "4th";
                case 5:
                    return "5th";
                case 6:
                    return "6th";
                case 7:
                    return "7th";
                default:
                    return "";
            }
        };

        $(el).find(".place").html(convert_place_to_string(player.place));
        $(el).find(".points").html(player.current_points.toString() + " (" + points_string + ")");
        $(el).find(".dice").html(player.dice_count.toString() + " (+" + player.reserves.toString() + ")");
        $(el).find(".lands").html(player.land_count.toString());
    });
};

Seats.prototype.turn_start = function(player_thin) {
  this.is_game_started = true;
  var ctx = this;
  $.each(this._seats, function(key, occupant) { 
		if (occupant.player != null && occupant.player.player_id == player_thin.player_id) {
			occupant.seat.find(".turn_progress").show();
            occupant.seat.addClass("active");
            occupant.timer.restart();

            if (player_thin.name == ctx.who_am_i) {
                occupant.seat.find(".end_turn").show();
            }
		} else {
			occupant.seat.find(".turn_progress").hide();
            occupant.seat.removeClass("active");
            occupant.seat.find(".end_turn").hide();
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

Seats.prototype.getColorOrNil = function(username) {
    var ctx = this;
    var colors = ["#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac"];
    var color = null;
    $.each(this._seats, function(key, occupant) {
        if (occupant.player != null) {
            if (occupant.player.name == username) {
                color = colors[parseInt(key)];
                return false;
            }
        }
    });

    return color;
};