/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameLogCtrl($scope, pubsub, global) {
    $scope.messages = [];

    function scroll(){
        var element = $('#log-window');  //TODO: AngularJS No-No
        element.animate({ scrollTop: element.prop("scrollHeight") }, 300);
    };

    $scope.colorStyle = function(username) {
        return {
            color: global.get_color_of_player(username)
        };
    }

    pubsub.subscribe("channel_changed", function(channel){

        channel.bind('game_start', function(data) {
            for(var i=0; i<data.players.length; i++) {
                var p = data.players[i];

                if (p.is_turn == true) {
                    $scope.$apply(function(){
                        $scope.messages.push({
                            type: "game_started"
                        });
                        $scope.messages.push({
                            type: "turn_changed",
                            username: p.name
                        });
                    });
                    scroll();
                }
            }
        });

        channel.bind('attack', function(data) {
            var temp = [];

            var atotal = 0;

            angular.forEach(data.attack_info.attacker_roll ,function(num) {
                temp.push(num.toString());
                atotal += num;
            });
            var arolls = temp.join(",");

            temp = [];
            var dtotal = 0;
            angular.forEach(data.attack_info.defender_roll ,function(num) {
                temp.push(num.toString());
                dtotal += num;
            });
            var drolls = temp.join(",");

            var dpid = data.attack_info.defender_player_id;
            var dname = null;
            angular.forEach(data.players ,function(player) {
                if (player.player_id == dpid) {
                    dname = player.name;
                }
            });

            var verb = atotal > dtotal ? "defeated" : "defended";
            var vs = data.attack_info.attacker_roll.length.toString() + "v" + data.attack_info.defender_roll.length.toString();
            var total = '{0} to {1}'.f(atotal, dtotal);
            var rolls = '({0} to {1})'.f(arolls, drolls);

            $scope.$apply(function(){
                $scope.messages.push({
                    type: "attack",
                    username: dname,
                    verb: verb,
                    vs: vs,
                    total: total,
                    rolls: rolls
                });
            });
            scroll();
        });

        channel.bind('game_winner', function(player) {
            $scope.$apply(function(){
                $scope.messages.push({
                    type: "game_winner",
                    username: player.name
                });
            });
            scroll();
        });

        channel.bind('new_turn', function(data) {
            $scope.$apply(function(){
                $scope.messages.push({
                    type: "turn_changed",
                    username: data.current_player.name
                });
            });
            scroll();
        });

    });

}
