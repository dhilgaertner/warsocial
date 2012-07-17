/**
 * DiceBox Managing class
 */

function DiceBox() {

    var player_colour_fill = ["#CCCCCC", "#f8af01", "#3760ae", "#c22b2b", "#5fb61f", "#603bb3", "#27a7b2", "#ad3bac", "#814f2e"];
    var player_colour_stroke = ["#CCCCCC", "#ffcc00", "#296dff", "#ed1a1a", "#86ce28", "#7743ec", "#2bb9dd", "#ca43ec", "#a26136"];
    var player_colour_text = ["#CCCCCC", "#e0c148", "#9dbcff", "#ff8c8c", "#9cd552", "#ad89ff", "#63c8e2", "#db8eef", "#c78458"];

    var BOX_X = 280;          // x location of the box
    var BOX_Y = 330;          // y location of the box
    var BOX_HEIGHT = 75;
    var BOX_CORNER = 8;       // roundness of the box corner
    var DICE_X = 38;          // x location of the row of dice
    var DICE_Y = 18;          // y location of the row of dice
    var DICE_X_SPACE = 20;    // x spacing between each dice
    var DICE_Y_SPACE = 30;    // y spacing between each roll of dice
    var TEXT_X = 8;           // x location of the dice roll text
    var TEXT_Y = 8;          // y location of the dice roll text
    var TEXT_Y_SPACE = 31;    // y spacing between the dice roll text
    var DELAY_BETWEEN_DICE = 100; // Delay between each dice
    var TEXT_ID_ATTACKER = "#dice_box_text_attacker";
    var TEXT_ID_DEFENDER = "#dice_box_text_defender";

    var box_width;     // width of the box, will calculate dynamically depending on the number of dice

    // dicebox
    var DICE_BOX_DELAY = 10;
    var dicetimer; // timer for the dicebox
    var hide_dicebox_timer; // timer for hiding the dicebox
    var attacker_roll = new Array(); // Array containing the rolls
    var defender_roll = new Array(); // Array containing the rolls
    var rollindex = 0; // rollindex for showing the dice
    var attacker_id;
    var defender_id;
    var attacker_sum = 0; // current sum of the dice for the attacker
    var defender_sum = 0; // current sum of the dice for the defender

    // canvas information
    var canvas = document.getElementById("canvas_dice_box");
    var ctx = canvas.getContext('2d');

    this.getPlayerColourStroke = function() { return player_colour_stroke };
    this.getPlayerColourFill = function() { return player_colour_fill };
    this.getPlayerColourText = function() { return player_colour_text };
    this.getRollIndex = function() { return rollindex; };
    this.getDiceTimer = function() { return dicetimer; };
    this.setDiceTimer = function() {
        if (dicetimer != undefined) clearInterval(dicetimer);
        var scop = this;
        dicetimer = setInterval(function(){ scop.dice_box_display_dice()}, DICE_BOX_DELAY);
    };
    this.clear_dicetimer = function() { if (dicetimer != undefined) clearInterval(dicetimer); };

    this.getAttackerSum = function() { return attacker_sum; };
    this.getDefenderSum = function() { return defender_sum; };
    this.setAttackerSum = function(val) { attacker_sum = val; };
    this.setDefenderSum = function(val) { defender_sum = val; };

    // set the style of the text
    var text_css = {'margin':'0', 'padding':'0', 'font-family':'arial', 'font-size':'24px', 'font-weight':'bold'};
    $(TEXT_ID_ATTACKER).css(text_css);
    $(TEXT_ID_DEFENDER).css(text_css);

    /**
     *
     * Hex to R, G, B
     */
    this.hexToR = function( h ) { return parseInt((this.cutHex(h)).substring(0,2),16) };
    this.hexToG = function( h ) { return parseInt((this.cutHex(h)).substring(2,4),16) };
    this.hexToB = function( h ) { return parseInt((this.cutHex(h)).substring(4,6),16) };
    this.cutHex = function( h ) { return (h.charAt(0)=="#") ? h.substring(1,7):h };

    /**
    * Draw dice box with dice rolls
     * AttackerId and defenderId need to be SEAT id
    **/
    this.show_dice_box = function(attackerRoll, defenderRoll, attackerId, defenderId){
        //console.log("dicebox show : " + attackerRoll.toString() + " "  + defenderRoll.toString() + " "  + attackerId.toString() + " "  + defenderId.toString() );
        // clear
        this.clear_dice_box();
        clearTimeout(hide_dicebox_timer);
        this.clear_dicetimer();
        rollindex = 0;

        attacker_roll = attackerRoll;
        defender_roll = defenderRoll;
        attacker_id = attackerId;
        defender_id = defenderId;

        var x = 0, y = 0, i = 0;
        var this_scope = this;

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

        // set sum of the rolls to 0
        $(TEXT_ID_ATTACKER).html("0");
        $(TEXT_ID_DEFENDER).html("0");

        // position text
        $(TEXT_ID_ATTACKER).css({top: y + TEXT_Y, left: x + TEXT_X});
        $(TEXT_ID_DEFENDER).css({top: y + TEXT_Y + TEXT_Y_SPACE, left: x + TEXT_X});

        // style text
        $(TEXT_ID_ATTACKER).css('color', this.getPlayerColourText()[attacker_id]);
        $(TEXT_ID_DEFENDER).css('color', this.getPlayerColourText()[defender_id]);
        $(TEXT_ID_ATTACKER).css({ opacity: 1.0 });
        $(TEXT_ID_DEFENDER).css({ opacity: 1.0 });

        // timer
        this.setDiceTimer();

        //animate show
        $("#canvas_dice_box").css({opacity:1.0});
        //$("#canvas_dice_box").animate({opacity:1.0}, 150);

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
        //console.log("dicbox display dice i="+i);
        var sum = 0;    // sum of the dice rolls
        if (i < attacker_roll.length || i < defender_roll.length) {

            // calculate x to centre the box
            var x = BOX_X - box_width/2;
            var y = BOX_Y;

            //attacker
            if (attacker_roll.length > i) {
              this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y, attacker_roll[i], true, ctx, attacker_id);
                //get previous sum of the dice from the html and add the new dice roll
                sum =  this.getAttackerSum();
                sum += attacker_roll[i];
                this.setAttackerSum(sum);
                $(TEXT_ID_ATTACKER).html(sum);
            }

            // defender
            if (defender_roll.length > i) {
                this.draw_dice(x + DICE_X + (DICE_X_SPACE*i), y + DICE_Y + DICE_Y_SPACE, defender_roll[i], true, ctx, defender_id);
                //get previous sum of the dice from the html and add the new dice roll
                sum =  this.getDefenderSum();
                sum += defender_roll[i];
                this.setDefenderSum(sum);
                $(TEXT_ID_DEFENDER).html(sum);
            }

            rollindex++;
        } else {
            // fade out loser
            if (this.getAttackerSum() > this.getDefenderSum()){
                $(TEXT_ID_DEFENDER).css({ opacity: 0.5 });
            }
            else{
                $(TEXT_ID_ATTACKER).css({ opacity: 0.5 });
            }

            this.clear_dicetimer();
            defender_roll = new Array();
            attacker_roll = new Array();
            this.setAttackerSum(0);
            this.setDefenderSum(0);
            rollindex = 0;
        }
    };

    /**
    * Hide dice box with animation
    **/
    this.hide_dice_box = function(scope){
        //$("#canvas_dice_box").animate({opacity:0.0}, 150, scope.clear_dice_box);
        $("#canvas_dice_box").css({opacity:0.0});
        $(TEXT_ID_ATTACKER).html("");
        $(TEXT_ID_DEFENDER).html("");
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
    this.draw_dice = function(x, y, value, has_shadow, context, player_colour_id){
        var DICE_IMG_ID = "dice";
        var DICE_SHADOW_ID = "dice_shadow";
        var IMG_OFFSET_X = 4;
        var IMG_OFFSET_Y = -6;
        var IMG_WIDTH = 20;
	    var IMG_HEIGHT = 20;
        var SHADOW_OFFSET_X = IMG_OFFSET_X-2;
        var SHADOW_OFFSET_Y = IMG_OFFSET_Y+4;


        var img = $("#"+(DICE_IMG_ID+value))[0];

        if (has_shadow){
             var img_shadow = $("#"+DICE_SHADOW_ID)[0];
            context.drawImage(img_shadow, x+SHADOW_OFFSET_X, y+SHADOW_OFFSET_Y);
        }

        //draw dice with a colour
       // var canvas_colour = document.createElement('canvas');	// create a temp canvas for the colour of the dice
        var canvas_colour = $("#canvas_dice")[0];
        var canvas_margin = 10;
        var ctx_colour = canvas_colour.getContext('2d');
        var colour_hex = this.getPlayerColourFill()[player_colour_id];
        var colour_alpha = 0.4;
        var colour_rgba = "rgba(" + this.hexToR(colour_hex) + "," + this.hexToG(colour_hex) + "," + this.hexToB(colour_hex) + "," + colour_alpha + ")";

        canvas_colour.width = IMG_WIDTH+canvas_margin*2;
        canvas_colour.height = IMG_HEIGHT+canvas_margin*2;

        ctx_colour.fillStyle = colour_rgba;     // set colour
        ctx_colour.drawImage(img, IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin);  // draw dice image
        ctx_colour.globalCompositeOperation="lighter";      // use 'lighter' to create an overlay colour effect
        ctx_colour.fillRect(IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin, IMG_WIDTH, IMG_HEIGHT);   // draw a coloured rectangle
        ctx_colour.globalCompositeOperation = "destination-in";   // use 'destination-in' to draw dice image again, removing parts of the coloured rectangle that are not on the dice
        ctx_colour.drawImage(img, IMG_OFFSET_X+canvas_margin, IMG_OFFSET_Y+canvas_margin);

        context.drawImage(canvas_colour, x-canvas_margin, y-canvas_margin);     // add the colour to the dice canvas
        ctx_colour.clearRect(0, 0, canvas_colour.width, canvas_colour.height);
    };

}