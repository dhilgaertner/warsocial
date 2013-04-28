/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 2/10/13
 * Time: 6:14 PM
 */

function GameLobbyCtrl($scope, $http, pubsub) {

    angular.element('#game_lobby_open').bind('click', function() {
        if ($scope.skip_fetch) {
            $scope.skip_fetch = false;
            return;
        }
        $scope.fetchData();
    });

    $scope.fetchData = function() {
        $http.get('/home/get_lobby_games').success(function(data) {
            $scope.online_users = data.online;
            $scope.live_games = data.games;
            $scope.multiday_games = data.multiday;
        });
    };

    $scope.fetchData();

    $scope.formatIsTurn = function(is_my_turn) {
        return is_my_turn ? "!!!" : "";
    };

    $scope.myTurns = function(multiday_games) {
        var my_turns = [];
        angular.forEach(multiday_games, function(game) {
            if (game.is_my_turn) {
                my_turns.push(game);
            }
        });
        return my_turns;
    };

    $scope.gotoGame = function(game_name) {
        $scope.skip_fetch = true;
        pubsub.publish("change_game", [game_name]);
        angular.element('#game_lobby_open').click();
    };

    $scope.gameRowStyle = function(game){
        var style = {
        };

        if (game.state == "game started") style["color"] = "grey";

        return style;
    }
}