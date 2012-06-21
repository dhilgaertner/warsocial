/**
 * Calls from the server
 */

function init( info ) {

    if (game != null || game != undefined) {
        game.reset();
        game = null;
    }
    game = new WarSocial();
    if (game != undefined && game != null) game.init(info);
}

function attack( info ) {
    try {
        if (game != undefined && game != null) game.attack(info);
    } catch(err) {
        alert(err + " json = " + json);
    }
}

function deploy( info ) {
    if (game != undefined && game != null) game.deploy(info);
}

function next_turn( id ) {
    if (game != undefined && game != null) game.nextTurn(parseInt(id));
}

function player_quit( id ) {
    if (game != undefined && game != null) game.playerQuit(id);
}

function dice_visible( is_visible ) {
    if (game != undefined && game != null) game.toggle_dice(is_visible);
}

function sounds_toggle( is_on ) {
    if (game != undefined && game != null) game.toggle_sounds(is_on);
}

/**
 * Calls TO the server
 */

function attack_out( attack_from, attack_to) {
    $.ajax({
      type: 'POST',
      url: '/game/' + global_game_name + '/attack',  //global_game_name is defined in index33.html.erb
      data: { atk_land_id: attack_from, def_land_id: attack_to },
      success: function(data) {

        },
      dataType: 'text'
    });
}
