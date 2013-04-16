/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameSeatsCtrl($scope, pubsub) {
    $scope.seats = [{},{},{},{},{},{},{}];

    $scope.top_seats = function() {
        return [
            $scope.seats[0],
            $scope.seats[2],
            $scope.seats[4],
            $scope.seats[6]
        ];
    };

    $scope.bottom_seats = function() {
        return [
            $scope.seats[1],
            $scope.seats[3],
            $scope.seats[5]
        ];
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

    $scope.clear_seats = function() {
        $scope.seats = [{},{},{},{},{},{},{}];
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

    pubsub.subscribe("game_init", function(data){
        $scope.clear_seats();
        angular.forEach(data.players, function(player){
            $scope.seats[player.seat_id - 1].player = player;
        });
    });
}
