/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 2/10/13
 * Time: 6:14 PM
 * To change this template use File | Settings | File Templates.
 */

function GameLobbyCtrl($scope, $http) {
    $http.get('/home/get_lobby_games').success(function(data) {
        $scope.online_users = data.online;
        $scope.live_games = data.games;
        $scope.multiday_games = data.multiday;
    });

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
        alert(game_name);
    };
}