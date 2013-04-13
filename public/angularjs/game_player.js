/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GamePlayerCtrl($scope, pubsub) {

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

    $scope.place = function() {
        switch($scope.player.place)
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

    $scope.points = function() {
        return $scope.player.current_points.toString();
    };

    $scope.delta_points = function() {
        var dp = $scope.player.delta_points.toString();

        if ($scope.player.delta_points != 0) {
            dp = player.delta_points > 0 ? "+" + dp : "-" + dp;
        }

        return dp;
    };

    $scope.dice_count = function() {
        return $scope.player.dice_count.toString();
    };

    $scope.reserves = function() {
        return $scope.player.reserves.toString();
    };

    $scope.land_count = function() {
        return $scope.player.land_count.toString();
    };
}
