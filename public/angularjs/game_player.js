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

    $scope.name = function() {
        return $scope.player.name;
    };

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
        return $scope.player.current_points;
    };

    $scope.delta_points = function() {
        var dp = $scope.player.delta_points.toString();

        if ($scope.player.delta_points != 0) {
            dp = player.delta_points > 0 ? "+" + dp : "-" + dp;
        }

        return dp;
    };

    $scope.dice_count = function() {
        return $scope.player.dice_count;
    };

    $scope.reserves = function() {;
        return $scope.player.reserves
    };

    $scope.land_count = function() {
        return $scope.player.land_count;
    };

    $scope.avatar_url = function() {
        if($scope.player == null || $scope.player.avatar_url == null){
            return "";
        }
        return $scope.player.avatar_url;
    };

    $scope.avatar_style = {
        "background-image": "url('" + $scope.avatar_url() + "');",
        "background-color": "#f8af01"
    };

}
