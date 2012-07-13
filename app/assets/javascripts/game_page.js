var global_game_name;
var global_init_data;

function game_page_init(game_name, init_data, maps, is_production, pusher_key, user_id, user_name, urls) {

    global_game_name = game_name;
    global_init_data = init_data;
    lobby_maps = maps;
    game = null;

    var seats = new Seats(7, global_init_data.players);
    seats.update_player_data(global_init_data.players);

    var chatbox = new ChatBox("chat_window", seats);
    var gamelog = new GameLog("log_window", seats);

    if (!is_production) {
        // Enable pusher logging - don't include this in production
        Pusher.log = function(message) {
            if (window.console && window.console.log) window.console.log(message);
        };

        // Flash fallback logging - don't include this in production
        WEB_SOCKET_DEBUG = true;
    }

    var pusher = new Pusher(pusher_key);
    var channel = pusher.subscribe("presence-" + game_name);
    Pusher.channel_auth_endpoint = urls.paurl;

    channel.bind('pusher:subscription_error', function(status) {
        if(status == 408 || status == 503){
            if (window.console && window.console.log) window.console.log("Error establishing connection: " + status.toString());
        }
    });

    channel.bind('pusher:subscription_succeeded', function(members) {
        var memArray = [];
        members.each(function(member) {
            if (member.id != "anon") {
                memArray.push(member.info.name);
            }
        });
        chatbox.addChatLine("Room", "Welcome to " + global_game_name + ". Players here: " + memArray.join(", ") + ".");
    });

    channel.bind('pusher:member_added', function(member) {
        if (member.id != "anon") {
            chatbox.addChatLine("Room", member.info.name + " is here.");
        }
    });

    channel.bind('pusher:member_removed', function(member) {
        if (member.id != "anon") {
            chatbox.addChatLine("Room", member.info.name + " has left.")
        }
    });

    $('#end_turn').hide();

    var lobby_modal = new Lobby("game_lobby");
    var create_game_modal = new CreateGame("create_game", lobby_maps);

    var who_am_i = user_id;
    var who_am_i_name = user_name;

    for(var i=0; i<global_init_data.players.length; i++) {
        if (global_init_data.players[i].is_turn == true) {
            seats.turn_start(global_init_data.players[i]);
            if (global_init_data.players[i].player_id == who_am_i) {
                $('#end_turn').show();
            }
        }
    }

    channel.bind('new_chat_line', function(data) {
        if (data.name != who_am_i_name) {
            chatbox.addChatLine(data.name, data.entry);
        }
    });

    channel.bind('game_start', function(data) {
        data.who_am_i = who_am_i;

        $('#end_turn').hide();
        for(var i=0; i<data.players.length; i++) {
            var p = data.players[i];

            if (p.is_turn == true) {
                seats.turn_start(p);
                if (p.player_id == who_am_i) {
                    $('#end_turn').show();
                }

                gamelog.logGameStarted();
                gamelog.logTurnChange(p.name);
            }
        }

        init(data);

        SoundManager.play("game_start");

        seats.update_player_data(data.players);
    });

    channel.bind('player_sit', function(player) {
        seats.sit(player);
    });

    channel.bind('player_stand', function(player) {
        seats.stand(player);
    });

    channel.bind('player_quit', function(player) {
        seats.update_player_data([player]);
        player_quit(player.player_id);
    });

    channel.bind('attack', function(data) {
        seats.turn_timer_restart({player_id: data.attack_info.attacker_player_id});
        seats.update_player_data(data.players);
        attack(data);
        gamelog.logAttack(data);
    });

    channel.bind('deploy', function(data) {
        deploy(data);
    });

    channel.bind('game_winner', function(player) {
        seats.clear();
        $('#end_turn').hide();

        gamelog.logGameWinner(player.name);
    });

    channel.bind('new_turn', function(data) {
        if (data.current_player.player_id == who_am_i) {
            $('#end_turn').show();
            SoundManager.play("my_turn");
        } else {
            $('#end_turn').hide();
        }

        next_turn(data.current_player.player_id);
        seats.turn_start({ player_id: data.current_player.player_id});
        seats.update_player_data([data.previous_player, data.current_player]);

        gamelog.logTurnChange(data.current_player.name);
    });

    $("#form_chat")
        .bind("ajax:beforeSend", function(xhr, settings) {
            chatbox.addChatLine(who_am_i_name, $('#entry').val());
            $('#entry').val("");
        });

    $('#dice_visible').change(function() {
        var checked = $('#dice_visible').prop('checked');
        dice_visible(checked);
    });
    $('#dice_visible').change();

    var update_stats_checkbox = function() {
        var checked = $('#stats').prop('checked');
        if (checked) {
            $('.stats_enabled').show();
        } else {
            $('.stats_enabled').hide();
        }
    };
    update_stats_checkbox();
    $('#stats').change(function() {
        update_stats_checkbox();
        var checked = $('#stats').prop('checked');

        if (user_id != 0) {
            $.post(urls.settings_toggle_stats_url, { on: checked });
        }
    });

    var update_sounds_checkbox = function() {
        var checked = $('#sounds').prop('checked');
        sounds_toggle(checked);
    };
    update_sounds_checkbox();
    $('#sounds').change(function() {
        update_sounds_checkbox();
        var checked = $('#sounds').prop('checked');

        if (user_id != 0) {
            $.post(urls.settings_toggle_sounds_url, { on: checked });
        }
    });

    $('#sit_button').bind('ajax:complete', function(evt, xhr, status) {
        switch(xhr.responseText) {
            case "not_logged_in":
                addToChat("Room", "You are not currently logged in.  Please re-login.");
                break;
            case "not_enough_points":
                addToChat("Room", "You do not have enough points to sit at this table.");
                break;
            case "already_in_game":
                addToChat("Room", "You are already seated in this game.");
                break;
        }
    });
}

