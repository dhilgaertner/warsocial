/**
 * Created with JetBrains RubyMine.
 * User: dhilgaertner
 * Date: 2/18/13
 * Time: 3:50 PM
 * To change this template use File | Settings | File Templates.
 */

$.cloudinary.config({"api_key":"372649425983884","cloud_name":"hedc00eau"});

//first, checks if it isn't implemented yet
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}