/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/30/13
 * Time: 2:03 PM
 */

function GameCreateCtrl($scope, $http, pubsub) {
    $scope.selectedMap = "default";
    $scope.selectedPlayers = 2;
    $scope.selectedWager = 0;
    $scope.selectedType = "normal";

    $http.get('/maps/get_maps').success(function(data) {
        $scope.maps = data.maps;
    });

    $scope.selectMap = function(map) {
        $scope.selectedMap = map.name;
    };

    $scope.selectPlayers = function(num) {
        $scope.selectedPlayers = num;
    };

    $scope.selectWager = function(wager) {
        $scope.selectedWager = wager;
    };

    $scope.selectType = function(type) {
        $scope.selectedType = type;
    };

    $scope.createGame = function() {
        var postData = {
            select_map: $scope.selectedMap,
            select_players: $scope.selectedPlayers,
            select_wager: $scope.selectedWager,
            game_type: $scope.selectedType
        };

        $http.post('/home/create_game', postData, { withCredentials: true }).success(function(data) {
            pubsub.publish("change_game", [data]);
            angular.element('#game_create_open').click();
        });
    };
}