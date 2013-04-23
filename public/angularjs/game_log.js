/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameLogCtrl($scope, pubsub) {
    $scope.messages = [];

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
                    dname = this.name;
                }
            });

            var verb = atotal > dtotal ? "defeated" : "defended";
            var vs = data.attack_info.attacker_roll.length.toString() + "v" + data.attack_info.defender_roll.length.toString();
            var total = '{0} to {1}'.f(atotal, dtotal);
            var rolls = '({0} to {1})'.f(arolls, drolls);

            $scope.$apply(function(){
                $scope.messages.push({
                    type: "attack",
                    defender: dname,
                    verb: verb,
                    vs: vs,
                    total: total,
                    rolls: rolls
                });
            });
        });

        channel.bind('game_winner', function(player) {
            $scope.$apply(function(){
                $scope.messages.push({
                    type: "game_winner",
                    username: player.name
                });
            });
        });

        channel.bind('new_turn', function(data) {
            $scope.messages.push({
                type: "turn_changed",
                username: data.current_player.name
            });
        });

    });

}
