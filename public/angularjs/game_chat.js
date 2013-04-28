/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameChatCtrl($scope, $http, pubsub, global) {
    $scope.messages = [];

    function scroll(){
        var element = $('#chat-window');  //TODO: AngularJS No-No
        element.animate({ scrollTop: element.prop("scrollHeight") }, 300);
    };

    $scope.colorStyle = function(username) {
        return {
            color: global.get_color_of_player(username)
        };
    };

    $scope.addChatLine = function(entry) {

        if (entry.trim() == "") {
            return;
        }

        $scope.messages.push({
            type: "regular",
            username: $scope.who_am_i_name,
            text: entry
        });

        var url = '/home/add_line';
        var postData = {
            game_name: $scope.game_name,
            entry: entry
        };

        $http.post(url, postData, { withCredentials: true }).success(function(data) {

        });

        $scope.entry = "";
        scroll();
    };

    pubsub.subscribe("channel_changed", function(channel){
        channel.bind('pusher:subscription_succeeded', function(members) {
            var memArray = [];
            members.each(function(member) {
                if (member.id != "anon") {
                    memArray.push(member.info.name);
                }
            });

            $scope.$apply(function(){
                $scope.messages.push({
                    type: "regular",
                    username: "Room",
                    text: "Welcome to " + $scope.game_name + ". Players here: " + memArray.join(", ") + "."
                });
            });

            scroll();
        });

        channel.bind('pusher:member_added', function(member) {
            if (member.id != "anon") {
                $scope.$apply(function(){
                    $scope.messages.push({
                        type: "regular",
                        username: "Room",
                        text: member.info.name + " is here."
                    });
                });

                scroll();
            }

        });

        channel.bind('pusher:member_removed', function(member) {
            if (member.id != "anon") {
                $scope.$apply(function(){
                    $scope.messages.push({
                        type: "regular",
                        username: "Room",
                        text: member.info.name + " has left."
                    });
                });

                scroll();
            }
        });

        channel.bind('new_chat_line', function(data) {
            if (data.name != $scope.who_am_i_name) {
                $scope.$apply(function(){
                    $scope.messages.push({
                        type: "regular",
                        username: data.name,
                        text: data.entry
                    });
                });

                scroll();
            }
        });

        channel.bind('server_message', function(data) {
            $scope.$apply(function(){
                $scope.messages.push({
                    type: "server",
                    username: "Server",
                    text: data
                });
            });

            scroll();
        });
    });

}
