/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameTimerCtrl($scope, $http, pubsub, global) {

    $scope.timer = null;
    $scope.current_player = null;

    $scope.timer_title = function() {
        if ($scope.current_player != null) {
            return "Current Turn";
        } else {
            return "Waiting for Players";
        }
    };

    $scope.current_player_name = function(){
        if ($scope.current_player != null) {
            return $scope.current_player.name;
        } else {
            return "";
        }
    };

    $scope.current_player_color = function(){
        if ($scope.current_player != null) {
            return global.get_color_of_player($scope.current_player.name);
        } else {
            return "#009F9D";
        }
    }

    $scope.update_current_player = function(players){
        angular.forEach(players, function(player){
            if(player.is_turn){
                $scope.current_player = player;
                return;
            }
        });
    };

    $scope.is_my_turn = function(){
        if ($scope.current_player == null) return false;

        return $scope.who_am_i == $scope.current_player.player_id;
    };

    $scope.end_turn = function(){
        if ($scope.is_my_turn()) {
            $http.get('/home/end_turn?game_name=' + $scope.game_name).success(function(data) {
                //TODO: Handle errors
            });
        }
    };

    pubsub.subscribe("channel_changed", function(channel){

        channel.bind('game_start', function(data) {
            $scope.update_current_player(data.players);
            $scope.timer.restart();
        });

        channel.bind('game_winner', function(player) {
            $scope.current_player = null;
            $scope.timer.stop();
        });

        channel.bind('attack', function(player) {
            $scope.timer.restart();
        });

        channel.bind('new_turn', function(data) {
            $scope.update_current_player([data.current_player]);
            $scope.timer.restart();
        });

    });

    pubsub.subscribe("game_init", function(data){
        var timer_time = $scope.game_type == "multi_day" ? 1000000 : 20;

        $scope.current_player = null;
        $scope.update_current_player(data.players);

        if ($scope.timer == null) {
            $scope.timer = new TurnTimer($('#turn-timer-box'), timer_time);
        } else {
            $scope.timer.stop();
            $scope.timer.change_duration(timer_time);
        }

        if ($scope.current_player != null) {
            $scope.timer.restart();
        }
    });

    $scope.progress_style = function() {
        return {
            "width": "100%",
            "height": "28px",
            "background-color": $scope.current_player_color()
        };
    };
}
