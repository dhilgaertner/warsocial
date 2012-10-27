
function Seats(who_am_i, numberOfSeats, players, is_started, timer_length) {
    var ctx = this;
    this._seats = new Object();
    this.is_game_started = is_started;
    this.who_am_i = who_am_i;
    this.timer = new TurnTimer($('#turn-timer-box') , timer_length);

    $('#game-forfeit').hide();
    $('#game-endturn').hide();
    $('#turn-timer-box').hide();

    $('#game-endturn').click(function() {
        if ($(this).hasClass('disabled')){
            return false;
        }
    });

    for (i = 0;i < numberOfSeats;i++) {
        var s = $('#game_seat_' + i.toString());
        this._seats[i.toString()] = { player: null, seat: s };
    }

    this.occupySeat = function(key, player) {
        var item = ctx._seats[key];

        item.player = player;
        $(item.seat).find('.name').html(player.name);

        $(item.seat).find('.action-sit').hide();
        $(item.seat).removeClass('dead');

        if(!ctx.is_game_started && player.name == who_am_i) {
            $(item.seat).find('.action-stand').show();
        }

        if (player.name == who_am_i) {
            if(ctx.is_game_started) {
                $("#game-forfeit").show();
                $("#game-endturn").show();
                $('#turn-timer-box').show();
            }
        }

        function finishPositionToBadge(position) {
            var response = {
                url: null,
                name: null
            };

            if (position > 100) return response;

            if (position > 25) {
                response.url = badges.top100;
                response.name = "Top 100";
            } else if(position > 10) {
                response.url = badges.top25;
                response.name = "Top 25";
            } else if(position > 3) {
                response.url = badges.top10;
                response.name = "Top 10";
            } else if(position == 3) {
                response.url = badges.bronze;
                response.name = "3rd";
            } else if(position == 2) {
                response.url = badges.silver;
                response.name = "2nd";
            } else if(position == 1) {
                response.url = badges.gold;
                response.name = "1st";
            }

            return response;
        };

        var finishes = $.parseJSON(player.medals_json);

        $.each(finishes, function (index, finish) {
            var el = $(item.seat).find(".medal")[index];
            var badge = finishPositionToBadge(finish);

            if (badge.url == null) return;

            $(el).css("background", "url('" + badge.url + "') transparent");

            var tooltip = $(el).data('tooltip');

            if (tooltip != null) {
                tooltip.enable();
                tooltip.options.title = badge.name;
            } else {
                $(el).tooltip({
                    html: false,
                    title: badge.name,
                    trigger: 'hover'
                });
            }
        });

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
        $(item.seat).find('.stats').hide();
        $(item.seat).find('.action-sit').show();
        $(item.seat).find('.action-stand').hide();
        $(item.seat).addClass('dead');
        $(item.seat).removeClass('active');

        var el = $(item.seat).find(".medal");

        $(el).css("background", "");

        $.each($(el), function (index, medal) {
            var tooltip = $(medal).data('tooltip');

            if (tooltip != null) {
                tooltip.disable();
            }
            //$(medal).data('tooltip', null);
        });
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
        $(occupant.seat).removeClass('dead');
        ctx.emptySeat(key);
    });

    $('#game-forfeit').hide();
    $('#game-endturn').hide();
    $('#turn-timer-box').hide();

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
            $('#game-forfeit').show();
            $('#game-endturn').show();
            $('#turn-timer-box').show();
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
			occupant.seat.addClass("active");

            if (player_thin.name == ctx.who_am_i) {
                $('#game-endturn').removeClass("disabled");
            } else {
                $('#game-endturn').addClass("disabled");
            }

            ctx.timer.restart();
            $('#turn-username').html(occupant.player.name);

        } else {
		    occupant.seat.removeClass("active");
		}
	});
};

Seats.prototype.turn_timer_restart = function(player_thin) {
    this.timer.restart();
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