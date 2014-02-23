/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner-updated
 * Date: 3/31/13
 * Time: 2:10 PM
 */

var wsApp = angular.module('wsApp', ['ui.bootstrap']);

/* pubsub - based on https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js*/
wsApp.factory('pubsub', function() {
    var cache = {};
    return {
        publish: function(topic, args) {
            cache[topic] && $.each(cache[topic], function() {
                this.apply(null, args || []);
            });
        },
        subscribe: function(topic, callback) {
            if(!cache[topic]) {
                cache[topic] = [];
            }
            cache[topic].push(callback);
            return [topic, callback];
        },
        unsubscribe: function(handle) {
            var t = handle[0];
            cache[t] && d.each(cache[t], function(idx){
                if(this == handle[1]){
                    cache[t].splice(idx, 1);
                }
            });
        }
    }
});

wsApp.factory('socket', function(pubsub) {

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

    var channel_init = function(channel){
        channel.bind('pusher:subscription_error', function(status) {
            if(status == 408 || status == 503){
                if (window.console && window.console.log) window.console.log("Error establishing connection: " + status.toString());
            }
        });
    };

    var pusherController = {
        change_channel: function(name){
            if (channel != null) {
                pusher.unsubscribe(channel.name);
            }
            channel = pusher.subscribe("presence-" + name);
            pubsub.publish("channel_changed", [channel]);
            channel_init(channel);
        }
    };

    return pusherController;
});

wsApp.factory('global', function() {
    return {
        get_player_color: function(username) {
            return "black";
        }
    };
});

wsApp.directive('eatClick', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    };
});
