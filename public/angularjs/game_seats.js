/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameSeatsCtrl($scope, pubsub) {

    $scope.top_seats = function() {
        var players = $scope.players;

        return players;
    };

    $scope.bottom_seats = function() {
        var players = $scope.players;
    };

    $scope.am_i_seated = function() {
        if ($scope.players != null){
            angular.forEach($scope.players, function(player){
                if($scope.who_am_i == player.name){
                    return true;
                }
            });
        }
        return false;
    };

    pubsub.subscribe("channel_changed", function(channel){

        channel.bind('game_start', function(data) {

        });

        channel.bind('player_sit', function(player) {

        });

        channel.bind('player_stand', function(player) {

        });

        channel.bind('player_quit', function(player) {

        });

        channel.bind('attack', function(data) {

        });

        channel.bind('game_winner', function(player) {

        });

        channel.bind('new_turn', function(data) {

        });
    });

    pubsub.subscribe("new_data", function(data){
        $scope.players = data.players;
    });
}
