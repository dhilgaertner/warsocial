/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameBoardCtrl($scope, $http, socket, pubsub) {

    $scope.fetchData = function(game_name) {
        var url = game_name != null
            ? '/game/' + game_name + '/json'
            : '/game/json';

        $http.get(url).success(function(data) {
            $scope.who_am_i = data.who_am_i;
            $scope.map_layout = data.map_layout;
            $scope.game_name = data.game_name;
            $scope.game_wager = data.game_wager;
            $scope.players = data.players;
            $scope.deployment = data.deployment;

            init(data);
            socket.change_channel(data.game_name);
        });
    };

    $scope.fetchData(null);

    pubsub.subscribe("change_game", function(game_name){
        $scope.fetchData(game_name);
    });

}
