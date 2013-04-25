var global_game_name;
var global_init_data;

function game_page_init(game_name, game_type, init_data, maps, is_production, pusher_key, user_id, user_name, urls) {

    global_game_name = game_name;
    global_init_data = init_data;
    lobby_maps = maps;
    game = null;

//    var is_game_started = false;
//
//    for(var i=0; i<global_init_data.players.length; i++) {
//        if (global_init_data.players[i].is_turn == true) {
//            is_game_started = true;
//        }
//    }
    //var timer_time = game_type == "multi_day" ? 1000000 : 20;
    //var seats = new Seats(user_name, 7, global_init_data.players, is_game_started, timer_time);
    //seats.update_player_data(global_init_data.players);

    //var chatbox = new ChatBox("chat-window", seats);
//    var gamelog = new GameLog("log-window", seats);

    var settings_modal = new Settings("settings");

    var who_am_i = user_id;
    var who_am_i_name = user_name;

//    for(var i=0; i<global_init_data.players.length; i++) {
//        if (global_init_data.players[i].is_turn == true) {
//            seats.turn_start(global_init_data.players[i]);
//        }
//    }

//    channel.bind('game_start', function(data) {
//        data.who_am_i = who_am_i;
//
//        for(var i=0; i<data.players.length; i++) {
//            var p = data.players[i];
//
//            if (p.is_turn == true) {
//                seats.turn_start(p);
//                gamelog.logGameStarted();
//                gamelog.logTurnChange(p.name);
//            }
//        }
//
//        init(data);
//
//        SoundManager.play("game_start");
//
//        seats.game_started();
//        seats.update_player_data(data.players);
//    });
//
//    channel.bind('player_sit', function(player) {
//        seats.sit(player);
//    });
//
//    channel.bind('player_stand', function(player) {
//        seats.stand(player);
//    });
//
//    channel.bind('player_quit', function(player) {
//        seats.update_player_data([player]);
//        player_quit(player.player_id);
//    });
//
//    channel.bind('attack', function(data) {
//        seats.turn_timer_restart({player_id: data.attack_info.attacker_player_id});
//        seats.update_player_data(data.players);
//        attack(data);
//        gamelog.logAttack(data);
//    });
//
//    channel.bind('deploy', function(data) {
//        deploy(data);
//    });
//
//    channel.bind('game_winner', function(player) {
//        seats.clear();
//
//        gamelog.logGameWinner(player.name);
//    });
//
//    channel.bind('new_turn', function(data) {
//        if (data.current_player.player_id == who_am_i) {
//            SoundManager.play("my_turn");
//        }
//
//        next_turn(data.current_player.player_id);
//        seats.turn_start({ name: data.current_player.name, player_id: data.current_player.player_id});
//        seats.update_player_data([data.previous_player, data.current_player]);
//
//        gamelog.logTurnChange(data.current_player.name);
//    });

//    $('#entry').keyup(function(event){
//        if(event.keyCode == 13){
//            chatbox.addChatLine(who_am_i_name, $('#entry').val());
//            $('#entry').val("");
//            $("#form_chat").submit();
//        }
//    });

    $('#dice_visible').click(function() {
        var visible = $(this).hasClass('active');

        if (visible) {
            $(this).find('i').removeClass('icon-eye-close');
            $(this).find('i').addClass('icon-eye-open');
        } else {
            $(this).find('i').removeClass('icon-eye-open');
            $(this).find('i').addClass('icon-eye-close');
        }

        if (typeof dice_visible !== 'undefined') {
            dice_visible(visible);
        }
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

    var sounds_on = $('#setting-sounds .active').val() == 'true';
    if (typeof sounds_toggle !== 'undefined') {
        sounds_toggle(sounds_on);
    }

    $('div.label-over label').labelOver('over-apply')

//    $('#map-voting').hover(
//        function () {
//            $(this).find('.btn').show();
//        },
//        function () {
//            $(this).find('.btn').hide();
//        }
//    );

//    var $mapInfo = $('#game-map-info');
//    $mapInfo.find('a.vote').click(function(){
//        var map = $mapInfo.data("map-id");
//        var vote = $(this).data("vote");
//
//        if (vote == "0") {
//            $mapInfo.addClass("thumb-down")
//            $mapInfo.removeClass("thumb-up")
//        } else {
//            $mapInfo.addClass("thumb-up")
//            $mapInfo.removeClass("thumb-down")
//        }
//
//        $.ajax({
//            type: "POST",
//            url: "/maps/" + map + "/vote",
//            data: { vote: vote.toString() },
//            dataType: 'json'
//        });
//
//        return false;
//    });

//    $('.action-sit a').bind('ajax:complete', function(evt, xhr, status) {
//        switch(xhr.responseText) {
//            case "not_logged_in":
//                chatbox.addChatLine("Room", "You are not currently logged in.  Please re-login.");
//                break;
//            case "not_enough_points":
//                chatbox.addChatLine("Room", "You do not have enough points to sit at this table.  This includes amounts already wagered at other tables you are currently seated at..");
//                break;
//            case "already_in_game":
//                chatbox.addChatLine("Room", "You are already seated in this game.");
//                break;
//        }
//    });
}

