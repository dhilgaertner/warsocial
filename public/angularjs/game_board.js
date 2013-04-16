/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameBoardCtrl($scope, $http, socket, pubsub) {

    $scope.is_game_started = function() {
        if ($scope.game_state != null){
            if ($scope.game_state == "game started") {
                return true;
            }
        }
        return false;
    };

    $scope.fetchData = function(game_name) {
        var url = game_name != null
            ? '/game/' + game_name + '/json'
            : '/game/json';

        $http.get(url).success(function(data) {
            $scope.who_am_i = data.who_am_i;
            $scope.game_name = data.game_name;
            $scope.game_wager = data.game_wager;
            $scope.game_state = data.game_state;

            init(data);

            socket.change_channel(data.game_name);

            pubsub.publish("game_init", [data]);
        });
    };

    $scope.fetchData(null);

    pubsub.subscribe("change_game", function(game_name){
        $scope.fetchData(game_name);
    });

    pubsub.subscribe("channel_changed", function(channel){

        channel.bind('game_start', function(data) {
            init(data);

            SoundManager.play("game_start");
        });

        channel.bind('player_quit', function(player) {
            player_quit(player.player_id);
        });

        channel.bind('attack', function(data) {
            attack(data);
        });

        channel.bind('deploy', function(data) {
            deploy(data);
        });

        channel.bind('new_turn', function(data) {
            if (data.current_player.player_id == who_am_i) {
                SoundManager.play("my_turn");
            }

            next_turn(data.current_player.player_id);
        });

    });
}
