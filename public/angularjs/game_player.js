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

    $scope.player_medals = function() {
        return $scope.is_player_seated() ? eval($scope.seat.player.medals_json) : [];
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

    $scope.is_player_dead = function() {
        if($scope.is_player_seated()){
            return $scope.seat.player.state == "dead";
        }
        return false;
    };

    $scope.avatar_style = function() {
        var style = {
            "background-color": $scope.seat_color($scope.seat) //TODO: Service for this...
        };

        if ($scope.player_avatar_url() != "") {
            style['background-image'] =  'url(' + $scope.player_avatar_url() +')';
        }

        return style;
    };

    $scope.medal_style = function() {
        return {
            "background-color": $scope.seat_color($scope.seat) //TODO: Service for this...
        };
    };

    function finishPositionToBadge(position) {
        var response = {
            url: null,
            name: null
        };

        if (position > 100) return response;

        if (position > 25) {
            response.url = badges.top100;
            response.name = "Top 100";
        } else if(position > 10) {
            response.url = badges.top25;
            response.name = "Top 25";
        } else if(position > 3) {
            response.url = badges.top10;
            response.name = "Top 10";
        } else if(position == 3) {
            response.url = badges.bronze;
            response.name = "3rd";
        } else if(position == 2) {
            response.url = badges.silver;
            response.name = "2nd";
        } else if(position == 1) {
            response.url = badges.gold;
            response.name = "1st";
        }

        return response;
    };

    $scope.medal_background = function(medal_spot) {
        var medals = $scope.player_medals();

        var medal = medals.length > medal_spot ? medals[medal_spot] : null;

        if (medal != null) {
            var b = finishPositionToBadge(medal);
            return {
                "background": "url('" + b.url + "') repeat scroll 0% 0% transparent"
            };
        } else {
            return {};
        }
    };
}
