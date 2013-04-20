/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GamePlayerSeatCtrl($scope, pubsub) {

    $scope.player_name = function() {
        return $scope.is_player_seated() ? $scope.seat.player.name : "";
    };

    $scope.player_place = function() {
        var place = $scope.is_player_seated() ? $scope.seat.player.place : -1;
        switch(place)
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

    $scope.player_points = function() {
        return $scope.is_player_seated() ? $scope.seat.player.current_points : 0;
    };

    $scope.player_delta_points = function() {
        if (!$scope.is_player_seated()) return "0";

        var dp = $scope.seat.player.delta_points.toString();

        if ($scope.seat.player.delta_points != 0) {
            dp = $scope.seat.player.delta_points > 0 ? "+" + dp : "-" + dp;
        }

        return dp;
    };

    $scope.player_dice_count = function() {
        return $scope.is_player_seated() ? $scope.seat.player.dice_count : 0;
    };

    $scope.player_reserves = function() {
        return $scope.is_player_seated() ? $scope.seat.player.reserves : 0;
    };

    $scope.player_land_count = function() {
        return $scope.is_player_seated() ? $scope.seat.player.land_count : 0;
    };

    $scope.player_avatar_url = function() {
        return $scope.is_player_seated() ? $scope.seat.player.avatar_url : "";
    };

    $scope.is_player_seated = function() {
        if($scope.seat.player != null){
            return true;
        }
        return false;
    };

    $scope.is_player_me = function() {
        if($scope.seat.player != null){
            if($scope.who_am_i == $scope.seat.player.player_id){
                return true;
            }
        }
        return false;
    };

    $scope.is_player_turn = function() {
        if($scope.is_player_seated()){
            return $scope.seat.player.is_turn != null ? $scope.seat.player.is_turn : false;
        }
        return false;
    };

    $scope.avatar_style = {
        "background-image": "url('" + $scope.player_avatar_url() + "');",
        "background-color": "#f8af01"
    };
}
