/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/30/13
 * Time: 2:03 PM
 */

function GameCreateCtrl($scope, $http) {

    angular.element('#game_create_open').bind('click', function() {
        $scope.fetchData();
    });

    $scope.selectMap = function(map) {
        $scope.selectedMap = map.name;
    };

    $scope.fetchData = function() {
        $http.get('/maps/get_maps').success(function(data) {
            $scope.maps = data.maps;
        });
    };

}