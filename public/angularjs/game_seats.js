/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameSeatsCtrl($scope, $http, pubsub) {
    $scope.seats = [{},{},{},{},{},{},{}];

    $scope.update_seats = function(players) {
        angular.forEach(players, function(player){
            $scope.seats[player.seat_id - 1].player = player;
        });
    };

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

    $scope.sit = function(game_name) {
        $http.get('/home/sit?game_name=' + game_name).success(function(data) {
            console.log(data);
        });
    };

    $scope.stand = function(game_name) {
        $http.get('/home/stand?game_name=' + game_name).success(function(data) {
            console.log(data);
        });
    };

    pubsub.subscribe("channel_changed", function(channel){

        channel.bind('game_start', function(data) {
            $scope.$apply(function(){
                $scope.update_seats(data.players);
            });
        });

        channel.bind('player_sit', function(player) {
            $scope.$apply(function(){
                $scope.update_seats([player]);
            });
        });

        channel.bind('player_stand', function(player) {
            $scope.$apply(function(){
                $scope.update_seats([player]);
            });
        });

        channel.bind('player_quit', function(player) {
            $scope.$apply(function(){
                $scope.update_seats([player]);
            });
        });

        channel.bind('attack', function(data) {
            $scope.$apply(function(){
                $scope.update_seats(data.players);
            });
        });

        channel.bind('game_winner', function(player) {
            $scope.$apply(function(){
                $scope.clear_seats();
            });
        });

        channel.bind('new_turn', function(data) {
            $scope.$apply(function(){
                $scope.update_seats([data.previous_player, data.current_player]);
            });
        });
    });

    pubsub.subscribe("game_init", function(data){
        $scope.clear_seats();
        $scope.update_seats(data.players);
    });
}
