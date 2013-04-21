/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameMapInfoCtrl($scope, $http, pubsub) {

    $scope.is_favorite = function() {

    };

    $scope.is_up_vote = function() {

    };

    $scope.is_down_vote = function() {

    };

    $scope.vote_percentage = function(vote) {
        if ($scope.votes == null) return 0;

        var v1 = vote;
        var v2 = vote == 0 ? 1 : 0;

        if ($scope.votes[v1] == 0) {
            return 0;
        } else {
            var perc = ($scope.votes[v1] / ($scope.votes[v1] + $scope.votes[v2])) * 100.0;

            return perc;
        }
    };

    $scope.vote = function(is_up) {
        $http.get('/home/stand?game_name=' + game_name).success(function(data) {
            //TODO: Failure Condition
        });
    };

    $scope.favorite = function(is_up) {
        $http.get('/home/stand?game_name=' + game_name).success(function(data) {
            //TODO: Failure Condition
        });
    };

    $scope.fetchData = function(id) {
        var url = '/maps/' + id + '/info';

        $http.get(url).success(function(data) {
            $scope.map = data.map;
            $scope.map.id = data.map_id;
            $scope.votes = data.votes;
            $scope.favorites = data.favorites;
            $scope.my_votes = data.my_votes;
            $scope.my_library = data.my_library;
        });
    };

    pubsub.subscribe("game_init", function(data){
        $scope.fetchData(data.map_id);
    });

    $scope.progress_style = function() {
        return {
            "height": "28px",
            "background-color": "green",
            "position": "absolute",
            "width": $scope.vote_percentage(1) + "%",
            "top": "0px",
            "left": "0px"
        };
    };
}
