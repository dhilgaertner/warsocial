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

/**
 * Calls TO the server
 */

function attack_out( attack_from, attack_to) {
    $.ajax({
      type: 'POST',
      url: '/game/' + global_game_name + '/attack',  //global_game_name is defined in index.html.erb
      data: { atk_land_id: attack_from, def_land_id: attack_to },
      success: function(data) {

        },
      dataType: 'text'
    });
}

/**
 * DiceBox Managing class
 */

function DiceBox() {

    var player_colour_fill = ["#CCCCCC", "#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac", "#814f2e"];
    var player_colour_stroke = ["#CCCCCC", "#ffcc00", "#296dff", "#ed1a1a", "#86ce28", "#7743ec", "#2bb9dd", "#ca43ec", "#a26136"];

    var BOX_X = 280;          // x location of the box
    var BOX_Y = 330;          // y location of the box
    var BOX_HEIGHT = 75;
    var BOX_CORNER = 8;       // roundness of the box corner
    var DICE_X = 38;          // x location of the row of dice
    var DICE_Y = 18;          // y location of the row of dice
    var DICE_X_SPACE = 20;    // x spacing between each dice
    var DICE_Y_SPACE = 30;    // y spacing between each roll of dice
    var TEXT_X = 8;           // x location of the dice roll text
    var TEXT_Y = 31;          // y location of the dice roll text
    var TEXT_Y_SPACE = 31;    // y spacing between the dice roll text
    var DELAY_BETWEEN_DICE = 100; // Delay between each dice

    var box_width;     // width of the box, will calculate dynamically depending on the number of dice

    // dicebox
    var DICE_BOX_DELAY = 60;
    var dicetimer; // timer for the dicebox
    var hide_dicebox_timer; // timer for hiding the dicebox
    var attacker_roll = new Array(); // Array containing the rolls
    var defender_roll = new Array(); // Array containing the rolls
    var rollindex = 0; // rollindex for showing the dice

    // canvas information
    var canvas = document.getElementById("canvas_dice_box");
    var ctx = canvas.getContext('2d');

    this.getPlayerColourStroke = function() { return player_colour_stroke };
    this.getPlayerColourFill = function() { return player_colour_fill };
    this.getRollIndex = function() { return rollindex; };
    this.getDiceTimer = function() { return dicetimer; };
    this.setDiceTimer = function() { if (dicetimer != undefined) clearInterval(dicetimer); var scop = this; dicetimer = setInterval(function(){ scop.dice_box_display_dice()}, DICE_BOX_DELAY); };


    /**
    * Draw dice box with dice rolls
    **/
    this.show_dice_box = function(attackerRoll, defenderRoll, attacker_id, defender_id){

        attacker_roll = attackerRoll;
        defender_roll = defenderRoll;

        var x = 0, y = 0, i = 0;
        var sum1 = 0;      // sum of the dice rolls for player 1
        var sum2 = 0;      // sum of the dice rolls for player 2
        var this_scope = this;

        // clear
        this.clear_dice_box();
        clearTimeout(hide_dicebox_timer);

        // change box width depending on the number of dice
        if (attacker_roll.length > defender_roll.length){
            box_width = DICE_X + (DICE_X_SPACE * (attacker_roll.length+1));
        }
        else {
            box_width = DICE_X + (DICE_X_SPACE * (defender_roll.length+1));
        }

        // calculate x to centre the box
        x = BOX_X - box_width/2;
        y = BOX_Y;

        // draw box
        this.draw_dice_box(x, y, box_width, BOX_HEIGHT, BOX_CORNER, ctx);

        // draw content
        ctx.font="bold 24px Arial";

        // draw result attacker
        for (i=0; i<attacker_roll.length; i++){
            //this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y, attacker_roll[i], true, ctx);
            sum1 += attacker_roll[i];
        }
        ctx.fillStyle = this.getPlayerColourStroke()[attacker_id];
        ctx.fillText(sum1, x + TEXT_X, y + TEXT_Y);

        // draw result defender
        for (i=0; i<defender_roll.length; i++){
            //this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y + DICE_Y_SPACE, defender_roll[i], true, ctx);
            sum2 += defender_roll[i];
        }
        ctx.fillStyle = this.getPlayerColourStroke()[defender_id];
        ctx.fillText(sum2, x + TEXT_X, y + TEXT_Y + TEXT_Y_SPACE);

        // timer
        this.setDiceTimer();

        // fade out loser (draw on top with black text)
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        if (sum1 > sum2){
            ctx.fillText(sum2, x + TEXT_X, y + TEXT_Y + TEXT_Y_SPACE);
        }
        else if (sum1 < sum2){
            ctx.fillText(sum1, x + TEXT_X, y + TEXT_Y);
        }

        //animate show
        $("#canvas_dice_box").css({opacity:0.0});
        $("#canvas_dice_box").animate({opacity:1.0}, 150);

        // set timer to hide
        hide_dicebox_timer = setTimeout(function() { this_scope.hide_dice_box(this_scope);}, 2000);
    };

    /**
    * Draw dice box
    **/
    this.draw_dice_box = function(x, y, width, height, corner, ctx){
        // draw box
        ctx.beginPath();
        ctx.moveTo(x + corner, y);
        ctx.lineTo(x + width - corner, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
        ctx.lineTo(x + width, y + height - corner);
        ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
        ctx.lineTo(x + corner, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
        ctx.lineTo(x, y + corner);
        ctx.quadraticCurveTo(x, y, x + corner, y);
        ctx.closePath();

        // put shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.fillStyle = "rgba(0, 0 ,0, 1.0)";
        ctx.fill();             // draw shadow shape
        ctx.globalCompositeOperation="xor";	// use xor to only get the shadow around the box
        ctx.shadowBlur = 0;     // remove shadow
        ctx.fill();             // draw shape to mask out previous shape, except for the shadow
        ctx.globalCompositeOperation="source-over"; // return to default

        // draw outline
        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // draw hilight line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // put gradient
        var gradient = ctx.createLinearGradient(x, y, x, y+height);
        gradient.addColorStop(1.0, "rgba(50, 50, 50, 0.95)");
        gradient.addColorStop(0.0, "rgba(100, 100, 100, 0.95)");
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    /**
     * Display a pair of dice at a time
     */
    this.dice_box_display_dice = function() {
        var i = this.getRollIndex();
        if (i < attacker_roll.length || i < defender_roll.length) {

            // calculate x to centre the box
            var x = BOX_X - box_width/2;
            var y = BOX_Y;

            //attacker
            if (attacker_roll.length > i)  this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y, attacker_roll[i], true, ctx);

            // defender
            if (defender_roll.length > i) this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y + DICE_Y_SPACE, defender_roll[i], true, ctx);

            rollindex++;
        } else {
            clearInterval(this.getDiceTimer());
            defender_roll = new Array();
            attacker_roll = new Array();
            rollindex = 0;
        }
    };

    /**
    * Hide dice box with animation
    **/
    this.hide_dice_box = function(scope){
        $("#canvas_dice_box").animate({opacity:0.0}, 150, scope.clear_dice_box);
    };

    /**
    * Clear the canvas of the dice box
    **/
    this.clear_dice_box = function(){
        var canvas = document.getElementById("canvas_dice_box");
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /**
    * Draw the dice graphics at a specific spot on the canvas
    **/
    this.draw_dice = function(x, y, value, has_shadow, context){
        var DICE_IMG_ID = "dice";
        var DICE_SHADOW_ID = "dice_shadow";
        var IMG_OFFSET_X = 4;
        var IMG_OFFSET_Y = -6;
        var SHADOW_OFFSET_X = IMG_OFFSET_X-2;
        var SHADOW_OFFSET_Y = IMG_OFFSET_Y+4;

        var img = document.getElementById(DICE_IMG_ID+ value);
        if (has_shadow){
            var img_shadow = document.getElementById(DICE_SHADOW_ID);
            context.drawImage(img_shadow, x+SHADOW_OFFSET_X, y+SHADOW_OFFSET_Y);
        }
        context.drawImage(img, x+IMG_OFFSET_X, y+IMG_OFFSET_Y);
    };

}