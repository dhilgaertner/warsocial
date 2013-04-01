/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 3/31/13
 * Time: 2:10 PM
 */

var wsApp = angular.module('wsApp', []);

wsApp.factory('socket', function() {

    if (!ws_options.is_production) {
        // Enable pusher logging - don't include this in production
        Pusher.log = function(message) {
            if (window.console && window.console.log) window.console.log(message);
        };

        // Flash fallback logging - don't include this in production
        WEB_SOCKET_DEBUG = true;
    }
    Pusher.channel_auth_endpoint = urls.paurl;

    var pusher = new Pusher(ws_options.pusherkey);
    var channel = null;
    var socketComm = {
        change_channel : function(newChannel) {
            if (channel != null) {
                channel.unsubscribe();
            }
            channel = pusher.subscribe("presence-" + newChannel);
        },
        on : function (eventName, callback) {
            alert(eventName);
        },
        emit :  function (eventName, data, callback) {
            alert(eventName);
        }
    };

    return socketComm;

});