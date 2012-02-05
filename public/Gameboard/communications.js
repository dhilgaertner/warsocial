/**
 * Calls from the server
 */

function init( json ) {

    if (game != null || game != undefined) {
        game.clear_all();
        game = null;
    }
    game = new WarSocial();
    var info = json;
    if (game != undefined && game != null) game.init(info);
}

function attack( json ) {
    try {
        var info = JSON.parse(json);
        if (game != undefined && game != null) game.attack(info);
    } catch(err) {
        alert(err + " json = " + json);
    }
}

function deploy( json ) {
    var info = JSON.parse(json);
    if (game != undefined && game != null) game.deploy(info);
}

function next_turn( id ) {
    if (game != undefined && game != null) game.nextTurn(parseInt(id));
}

function player_quit( id ) {
    if (game != undefined && game != null) game.playerQuit(id);
}

/**
 * Calls TO the server
 */

function attack_out( attack_from, attack_to) {
    //alert("Attack out : land " + attack_from + " to " + attack_to);
    // DEMO : User attacks anyone
    attack(get_attack_json(attack_from, attack_to));

    var json_deploy = '[' + get_json_deploy() + ']' ; // array; not json
    setTimeout(function() { deploy(json_deploy);}, 1500);

    var nextid = get_next_player();
    setTimeout(function() { game.nextTurn(nextid);}, 2500);
    $('textarea#jsonfeed').text("This is player " + nextid + "'s turn to play.");
}


/**
 * DEMO methods
 */

function get_attack_json(attack_from, attack_to) {
    var json;
    if (game != null && game != undefined) {

        var land1 = game.getMap().find_land_by_id(attack_from);
        var land2 = game.getMap().find_land_by_id(attack_to);

        var troop1 = land1.getTroops();
        var troop2 = land2.getTroops();

        var dice1 = generate_random_int(troop1, 6);
        var dice2;

        do { dice2 = generate_random_int(troop2, 6);  } while (dice1 == dice2);


        var attack_info = '"attack_info":{ "attacker_land_id" : ' + attack_from + ' ,"attacker_roll" : [ ' + dice1.toString() + ' ] ,"defender_land_id" : '+ attack_to + ',"defender_roll" : [ ' + dice2.toString() + ' ]}';

        if (array_sum(dice1) == array_sum(dice2) && land2.getOwner() != null) {
           return get_attack_json(attack_from, attack_to);
        } else {

            if (array_sum(dice1) > array_sum(dice2) || land2.getOwner() == null ) {
                var attack_from_troops = troop1-1;
                var attack_to_troops = 1;
                var attack_to_owner = land1.getOwner().getId();
            } else if (array_sum(dice1) < array_sum(dice2)) {
                attack_from_troops = 1;
                attack_to_troops = troop2;
                attack_to_owner = land2.getOwner().getId();
            }
            var deploy_info = '"deployment_changes":[ { "deployment" : ' + attack_from_troops + ' ,"land_id" : ' + attack_from +  ' ,"player_id" : ' + land1.getOwner().getId() + ' } ,{ "deployment" : ' + attack_to_troops + ' ,"land_id" : ' + attack_to +' ,"player_id" : '+ attack_to_owner + '}]';
            json = '{' + attack_info + ',' + deploy_info + '}';

        }
    }
    return json;
}

function generate_random_int(nb, max_val) {
    var result = new Array();
    for (var i = 0; i < nb; i++) {
        result.push(Math.floor(Math.random()*max_val+1));
    }
    return result;
}

function array_sum(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
}

function get_next_player() {
    var len = game.getPlayerList().length;
    var p = game.getCurrentPlayerId();
    (p == len)? p = 1 : p+=1;
    return p;
}

function get_json_deploy() {
    var result = new Array();
    var lands = game.getMap().find_lands_by_player_id(game.getCurrentPlayerId());
    for (var i = 0; i < lands.length; i++) {
        var object = '{"deployment":' + lands[i].getTroops() + ', "land_id":' + lands[i].getId();
        if (lands[i].getOwner() != null) object += ', "player_id":' + lands[i].getOwner().getId();
        object += '}';
        result.push(object);
    }
    return result;
}
