/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

function GameChatCtrl($scope, $http, socket, pubsub) {

    pubsub.subscribe("channel_changed", function(channel){
        channel.bind('pusher:subscription_succeeded', function(members) {
            var memArray = [];
            members.each(function(member) {
                if (member.id != "anon") {
                    memArray.push(member.info.name);
                }
            });
            //chatbox.addChatLine("Room", "Welcome to " + global_game_name + ". Players here: " + memArray.join(", ") + ".");
        });

        channel.bind('pusher:member_added', function(member) {
            if (member.id != "anon") {
                //chatbox.addChatLine("Room", member.info.name + " is here.");
            }
        });

        channel.bind('pusher:member_removed', function(member) {
            if (member.id != "anon") {
                //chatbox.addChatLine("Room", member.info.name + " has left.")
            }
        });

        channel.bind('new_chat_line', function(data) {
            if (data.name != who_am_i_name) {
                //chatbox.addChatLine(data.name, data.entry);
            }
        });

        channel.bind('server_message', function(data) {
            //chatbox.addServerMessage(data);
        });
    });

}
