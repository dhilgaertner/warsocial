/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameSeatsCtrl($scope, $http, pubsub, global) {
    $scope.seats = [{},{},{},{},{},{},{}];
    $scope.colors = ["#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac"];

    $scope.update_seats = function(players) {
        angular.forEach(players, function(player){
            $scope.seats[player.seat_id - 1].player = player;
        });
    };

    $scope.get_color_of_player = function(username) {
        var color = "black";

        $.each($scope.seats, function(index, seat) {
            if (seat.player != null) {
                if (seat.player.name == username) {
                    color = $scope.colors[index];
                    return false;
                }
            }
        });

        return color;
    }

    global.get_color_of_player = $scope.get_color_of_player;

    $scope.remove_occupant = function(player) {
        angular.forEach($scope.seats, function(seat){
            if (seat.player != null) {
                if (seat.player.player_id == player.player_id){
                    seat.player = null;
                }
            }
        });
    };

    $scope.seat_color = function(seat) {
        var index = $scope.seats.indexOf(seat);
        return $scope.colors[index];
    };

    $scope.top_seats = function() {
        if ($scope.number_of_seats > 6) {
            return [
                $scope.seats[0],
                $scope.seats[2],
                $scope.seats[4],
                $scope.seats[6]
            ];
        } else if ($scope.number_of_seats > 4){
            return [
                $scope.seats[0],
                $scope.seats[2],
                $scope.seats[4]
            ];
        } else if ($scope.number_of_seats > 2){
            return [
                $scope.seats[0],
                $scope.seats[2]
            ];
        } else if ($scope.number_of_seats > 0){
            return [
                $scope.seats[0]
            ];
        } else {
            return [];
        }
    };

    $scope.bottom_seats = function() {
        if ($scope.number_of_seats > 5) {
            return [
                $scope.seats[1],
                $scope.seats[3],
                $scope.seats[5]
            ];
        } else if ($scope.number_of_seats > 3){
            return [
                $scope.seats[1],
                $scope.seats[3]
            ];
        } else if ($scope.number_of_seats > 1){
            return [
                $scope.seats[1]
            ];
        } else {
            return [];
        }
    };

    $scope.am_i_seated = function() {
        var found = false;

        if ($scope.seats != null){
            angular.forEach($scope.seats, function(seat){
                if(seat.player != null) {
                    if($scope.who_am_i == seat.player.player_id){
                        found = true;
                    }
                }
            });
        }
        return found;
    };

    $scope.clear_seats = function() {
        $scope.seats = [{},{},{},{},{},{},{}];
    };

    $scope.sit = function(game_name) {
        $http.get('/home/sit?game_name=' + game_name).success(function(data) {
            //TODO: Failure Condition
        });
    };

    $scope.stand = function(game_name) {
        $http.get('/home/stand?game_name=' + game_name).success(function(data) {
            //TODO: Failure Condition
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
                $scope.remove_occupant(player);
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
        $scope.number_of_seats = data.max_player_count;
        $scope.clear_seats();
        $scope.update_seats(data.players);
    });
}
