function init(a){if(null!=game||void 0!=game)game.reset(),game=null;game=new WarSocial;void 0!=game&&null!=game&&game.init(a)}function attack(a){try{void 0!=game&&null!=game&&game.attack(a)}catch(b){alert(b+" json = "+json)}}function deploy(a){void 0!=game&&null!=game&&game.deploy(a)}function next_turn(a){void 0!=game&&null!=game&&game.nextTurn(parseInt(a))}function player_quit(a){void 0!=game&&null!=game&&game.playerQuit(a)}
function attack_out(a,b){$.ajax({type:"POST",url:"/game/"+global_game_name+"/attack",data:{atk_land_id:a,def_land_id:b},success:function(){},dataType:"text"})}
function DiceBox(){var a="#CCCCCC,#f8af01,#3760ae,#c22b2b,#5fb61f,#603bb3,#27a7b2,#ad3bac,#814f2e".split(","),b="#CCCCCC,#ffcc00,#296dff,#ed1a1a,#86ce28,#7743ec,#2bb9dd,#ca43ec,#a26136".split(","),d="#CCCCCC,#e0c148,#9dbcff,#ff8c8c,#9cd552,#ad89ff,#63c8e2,#db8eef,#c78458".split(","),e,g,f,h=[],i=[],k=0,l,m,n=0,o=0,p=document.getElementById("canvas_dice_box").getContext("2d");this.getPlayerColourStroke=function(){return b};this.getPlayerColourFill=function(){return a};this.getPlayerColourText=function(){return d};
this.getRollIndex=function(){return k};this.getDiceTimer=function(){return g};this.setDiceTimer=function(){void 0!=g&&clearInterval(g);var a=this;g=setInterval(function(){a.dice_box_display_dice()},10)};this.clear_dicetimer=function(){void 0!=g&&clearInterval(g)};this.getAttackerSum=function(){return n};this.getDefenderSum=function(){return o};this.setAttackerSum=function(a){n=a};this.setDefenderSum=function(a){o=a};var q={margin:"0",padding:"0","font-family":"arial","font-size":"24px","font-weight":"bold"};
$("#dice_box_text_attacker").css(q);$("#dice_box_text_defender").css(q);this.hexToR=function(a){return parseInt(this.cutHex(a).substring(0,2),16)};this.hexToG=function(a){return parseInt(this.cutHex(a).substring(2,4),16)};this.hexToB=function(a){return parseInt(this.cutHex(a).substring(4,6),16)};this.cutHex=function(a){return"#"==a.charAt(0)?a.substring(1,7):a};this.show_dice_box=function(a,b,d,g){this.clear_dice_box();clearTimeout(f);this.clear_dicetimer();k=0;h=a;i=b;l=d;m=g;var b=a=0,t=this;e=
h.length>i.length?38+20*(h.length+1):38+20*(i.length+1);a=280-e/2;b=330;this.draw_dice_box(a,b,e,75,8,p);$("#dice_box_text_attacker").html("0");$("#dice_box_text_defender").html("0");$("#dice_box_text_attacker").css({top:b+8,left:a+8});$("#dice_box_text_defender").css({top:b+8+31,left:a+8});$("#dice_box_text_attacker").css("color",this.getPlayerColourText()[l]);$("#dice_box_text_defender").css("color",this.getPlayerColourText()[m]);$("#dice_box_text_attacker").css({opacity:1});$("#dice_box_text_defender").css({opacity:1});
this.setDiceTimer();$("#canvas_dice_box").css({opacity:1});f=setTimeout(function(){t.hide_dice_box(t)},2E3)};this.draw_dice_box=function(a,b,d,e,f,g){g.beginPath();g.moveTo(a+f,b);g.lineTo(a+d-f,b);g.quadraticCurveTo(a+d,b,a+d,b+f);g.lineTo(a+d,b+e-f);g.quadraticCurveTo(a+d,b+e,a+d-f,b+e);g.lineTo(a+f,b+e);g.quadraticCurveTo(a,b+e,a,b+e-f);g.lineTo(a,b+f);g.quadraticCurveTo(a,b,a+f,b);g.closePath();g.shadowBlur=10;g.shadowColor="rgba(0, 0, 0, 0.5)";g.fillStyle="rgba(0, 0 ,0, 1.0)";g.fill();g.globalCompositeOperation=
"xor";g.shadowBlur=0;g.fill();g.globalCompositeOperation="source-over";g.strokeStyle="rgba(0, 0, 0, 0.15)";g.lineWidth=4;g.stroke();g.strokeStyle="rgba(255, 255, 255, 0.75)";g.lineWidth=2;g.stroke();a=g.createLinearGradient(a,b,a,b+e);a.addColorStop(1,"rgba(50, 50, 50, 0.95)");a.addColorStop(0,"rgba(100, 100, 100, 0.95)");g.fillStyle=a;g.fill()};this.dice_box_display_dice=function(){var a=this.getRollIndex(),b=0;if(a<h.length||a<i.length){var d=280-e/2;h.length>a&&(this.draw_dice(d+38+20*a,348,h[a],
!0,p,l),b=this.getAttackerSum(),b+=h[a],this.setAttackerSum(b),$("#dice_box_text_attacker").html(b));i.length>a&&(this.draw_dice(d+38+20*a,378,i[a],!0,p,m),b=this.getDefenderSum(),b+=i[a],this.setDefenderSum(b),$("#dice_box_text_defender").html(b));k++}else this.getAttackerSum()>this.getDefenderSum()?$("#dice_box_text_defender").css({opacity:0.5}):$("#dice_box_text_attacker").css({opacity:0.5}),this.clear_dicetimer(),i=[],h=[],this.setAttackerSum(0),this.setDefenderSum(0),k=0};this.hide_dice_box=
function(){$("#canvas_dice_box").css({opacity:0});$("#dice_box_text_attacker").html("");$("#dice_box_text_defender").html("")};this.clear_dice_box=function(){var a=document.getElementById("canvas_dice_box");a.getContext("2d").clearRect(0,0,a.width,a.height)};this.draw_dice=function(a,b,d,e,g,f){d=$("#dice"+d)[0];e&&(e=$("#dice_shadow")[0],g.drawImage(e,a+2,b+-2));var e=$("#canvas_dice")[0],h=e.getContext("2d"),f=this.getPlayerColourFill()[f],f="rgba("+this.hexToR(f)+","+this.hexToG(f)+","+this.hexToB(f)+
",0.4)";e.width=40;e.height=40;h.fillStyle=f;h.drawImage(d,14,4);h.globalCompositeOperation="lighter";h.fillRect(14,4,20,20);h.globalCompositeOperation="destination-in";h.drawImage(d,14,4);g.drawImage(e,a-10,b-10);h.clearRect(0,0,e.width,e.height)}};function DiceBox(){var a="#CCCCCC,#f8af01,#3760ae,#c22b2b,#5fb61f,#603bb3,#27a7b2,#ad3bac,#814f2e".split(","),b="#CCCCCC,#ffcc00,#296dff,#ed1a1a,#86ce28,#7743ec,#2bb9dd,#ca43ec,#a26136".split(","),d="#CCCCCC,#e0c148,#9dbcff,#ff8c8c,#9cd552,#ad89ff,#63c8e2,#db8eef,#c78458".split(","),e,g,f,h=[],i=[],k=0,l,m,n=0,o=0,p=document.getElementById("canvas_dice_box").getContext("2d");this.getPlayerColourStroke=function(){return b};this.getPlayerColourFill=function(){return a};this.getPlayerColourText=function(){return d};
this.getRollIndex=function(){return k};this.getDiceTimer=function(){return g};this.setDiceTimer=function(){void 0!=g&&clearInterval(g);var a=this;g=setInterval(function(){a.dice_box_display_dice()},10)};this.clear_dicetimer=function(){void 0!=g&&clearInterval(g)};this.getAttackerSum=function(){return n};this.getDefenderSum=function(){return o};this.setAttackerSum=function(a){n=a};this.setDefenderSum=function(a){o=a};var q={margin:"0",padding:"0","font-family":"arial","font-size":"24px","font-weight":"bold"};
$("#dice_box_text_attacker").css(q);$("#dice_box_text_defender").css(q);this.hexToR=function(a){return parseInt(this.cutHex(a).substring(0,2),16)};this.hexToG=function(a){return parseInt(this.cutHex(a).substring(2,4),16)};this.hexToB=function(a){return parseInt(this.cutHex(a).substring(4,6),16)};this.cutHex=function(a){return"#"==a.charAt(0)?a.substring(1,7):a};this.show_dice_box=function(a,b,d,g){this.clear_dice_box();clearTimeout(f);this.clear_dicetimer();k=0;h=a;i=b;l=d;m=g;var b=a=0,n=this;e=
h.length>i.length?38+20*(h.length+1):38+20*(i.length+1);a=280-e/2;b=330;this.draw_dice_box(a,b,e,75,8,p);$("#dice_box_text_attacker").html("0");$("#dice_box_text_defender").html("0");$("#dice_box_text_attacker").css({top:b+8,left:a+8});$("#dice_box_text_defender").css({top:b+8+31,left:a+8});$("#dice_box_text_attacker").css("color",this.getPlayerColourText()[l]);$("#dice_box_text_defender").css("color",this.getPlayerColourText()[m]);$("#dice_box_text_attacker").css({opacity:1});$("#dice_box_text_defender").css({opacity:1});
this.setDiceTimer();$("#canvas_dice_box").css({opacity:1});f=setTimeout(function(){n.hide_dice_box(n)},2E3)};this.draw_dice_box=function(a,b,d,e,g,f){f.beginPath();f.moveTo(a+g,b);f.lineTo(a+d-g,b);f.quadraticCurveTo(a+d,b,a+d,b+g);f.lineTo(a+d,b+e-g);f.quadraticCurveTo(a+d,b+e,a+d-g,b+e);f.lineTo(a+g,b+e);f.quadraticCurveTo(a,b+e,a,b+e-g);f.lineTo(a,b+g);f.quadraticCurveTo(a,b,a+g,b);f.closePath();f.shadowBlur=10;f.shadowColor="rgba(0, 0, 0, 0.5)";f.fillStyle="rgba(0, 0 ,0, 1.0)";f.fill();f.globalCompositeOperation=
"xor";f.shadowBlur=0;f.fill();f.globalCompositeOperation="source-over";f.strokeStyle="rgba(0, 0, 0, 0.15)";f.lineWidth=4;f.stroke();f.strokeStyle="rgba(255, 255, 255, 0.75)";f.lineWidth=2;f.stroke();a=f.createLinearGradient(a,b,a,b+e);a.addColorStop(1,"rgba(50, 50, 50, 0.95)");a.addColorStop(0,"rgba(100, 100, 100, 0.95)");f.fillStyle=a;f.fill()};this.dice_box_display_dice=function(){var a=this.getRollIndex(),b=0;if(a<h.length||a<i.length){var d=280-e/2;h.length>a&&(this.draw_dice(d+38+20*a,348,h[a],
!0,p,l),b=this.getAttackerSum(),b+=h[a],this.setAttackerSum(b),$("#dice_box_text_attacker").html(b));i.length>a&&(this.draw_dice(d+38+20*a,378,i[a],!0,p,m),b=this.getDefenderSum(),b+=i[a],this.setDefenderSum(b),$("#dice_box_text_defender").html(b));k++}else this.getAttackerSum()>this.getDefenderSum()?$("#dice_box_text_defender").css({opacity:0.5}):$("#dice_box_text_attacker").css({opacity:0.5}),this.clear_dicetimer(),i=[],h=[],this.setAttackerSum(0),this.setDefenderSum(0),k=0};this.hide_dice_box=
function(){$("#canvas_dice_box").css({opacity:0});$("#dice_box_text_attacker").html("");$("#dice_box_text_defender").html("")};this.clear_dice_box=function(){var a=document.getElementById("canvas_dice_box");a.getContext("2d").clearRect(0,0,a.width,a.height)};this.draw_dice=function(a,b,d,e,f,g){d=$("#dice"+d)[0];e&&(e=$("#dice_shadow")[0],f.drawImage(e,a+2,b+-2));var e=$("#canvas_dice")[0],h=e.getContext("2d"),g=this.getPlayerColourFill()[g],g="rgba("+this.hexToR(g)+","+this.hexToG(g)+","+this.hexToB(g)+
",0.4)";e.width=40;e.height=40;h.fillStyle=g;h.drawImage(d,14,4);h.globalCompositeOperation="lighter";h.fillRect(14,4,20,20);h.globalCompositeOperation="destination-in";h.drawImage(d,14,4);f.drawImage(e,a-10,b-10);h.clearRect(0,0,e.width,e.height)}};function Land(a){var b=0;void 0!=a&&(b=a);var d=null,e=0,g=0,f=[];this.getId=function(){return b};this.getOwner=function(){return d};this.setOwner=function(a){if(null==a||a instanceof Player)d=a};this.getTroops=function(){return e};this.setTroops=function(a){void 0!=a&&a.constructor===Number&&(g=a-e,e=a)};this.getNewTroops=function(){var a=0>g?0:g;g=0;return a};this.getAdjacentLandIds=function(){return f};this.addAdjacentLandId=function(a){void 0!=a&&a.constructor===Number&&-1==f.indexOf(a)&&f.push(a)}}
Land.prototype.isAdjacentTo=function(a){return a.constructor===Number&&-1!=this.getAdjacentLandIds().indexOf(a)?!0:!1};Land.prototype.toString=function(){return"[Land]"};function Map(a,b,d){var e=void 0!=a&&a.constructor===Number?a:0,g=void 0!=b&&b.constructor===Number?b:0,f=d instanceof Array?d:[],h=[];this.getLandList=function(){return h};this.getWidth=function(){return e};this.getHeight=function(){return g};this.getTiles=function(){return f};0<e&&0<g&&(h=this.createLandList(d),0<h.length&&(f=d));this.find_adjacent_lands_from_tiles(f,e,g);var i=new MapCanvas;this.getMapCanvas=function(){return i}}Map.prototype.toString=function(){return"[Map]"};
Map.prototype.createLandList=function(a){var b=[];if(void 0==a)return b;for(var d=a.length,e=0;e<d;)0!=a[e]&&void 0==b[a[e]]&&(b[a[e]]=new Land(a[e])),e++;return b};
Map.prototype.find_adjacent_lands_from_tiles=function(a,b,d){for(var e=0;e<d;e++)for(var g=0;g<b;g++){var f=e*b+g;if(0!=a[f]&&!(1==g%2&&e==d-1)){var h=void 0;g!=b-1&&(h=0==g%2?f+1:f+1+b);var i=void 0;0!=g&&(i=0==g%2?f-1:f-1+b);var k=void 0;e!=d-1&&(k=f+b);void 0!=i&&a[f]!=a[i]&&0!=a[i]&&(this.find_land_by_id(a[f]).addAdjacentLandId(a[i]),this.find_land_by_id(a[i]).addAdjacentLandId(a[f]));void 0!=h&&a[f]!=a[h]&&0!=a[h]&&(this.find_land_by_id(a[f]).addAdjacentLandId(a[h]),this.find_land_by_id(a[h]).addAdjacentLandId(a[f]));
void 0!=k&&a[f]!=a[k]&&0!=a[k]&&(this.find_land_by_id(a[f]).addAdjacentLandId(a[k]),this.find_land_by_id(a[k]).addAdjacentLandId(a[f]))}}};Map.prototype.find_land_by_id=function(a){return void 0!=a?this.getLandList()[a]:null};
Map.prototype.find_lands_by_player_id=function(a){var b=[];if(void 0!=a&&a.constructor===Number)for(var d=0;d<this.getLandList().length;)void 0!=this.getLandList()[d]&&null!=this.getLandList()[d].getOwner()&&this.getLandList()[d].getOwner().getId()==a&&b.push(this.getLandList()[d]),d++;return b};Map.prototype.claim=function(a,b,d){a=this.find_land_by_id(a);null!=a&&null!=b&&void 0!=b&&b instanceof Player&&(a.setOwner(b),void 0!=d&&d.constructor===Number&&a.setTroops(d))};
Map.prototype.free_land_owned_by=function(a){var b=[];if(void 0!=a&&a.constructor===Number){b=this.find_lands_by_player_id(a);for(a=0;a<b.length;)b[a].setOwner(null),a++}};Map.prototype.getLandPlayerList=function(){for(var a=[],b=this.getLandList(),d=0;d<b.length;)b[d]&&(a[b[d].getId()]=null!=b[d].getOwner()?b[d].getOwner().getSeatId():0),d++;return a};
Map.prototype.getLandByCoords=function(a,b){if(void 0==a||void 0==b||a.constructor!=Number||b.constructor!=Number||0>a||0>b||a>this.getWidth()-1||b>this.getHeight())return null;var d=b*this.getWidth()+a;return this.getTiles()[d]};Map.prototype.getDeploymentLandList=function(){for(var a=[],b=this.getLandList(),d=0;d<b.length;)b[d]&&(a[b[d].getId()]=[],a[b[d].getId()][0]=b[d].getTroops(),a[b[d].getId()][1]=b[d].getNewTroops()),d++;return a};
Map.prototype.drawcanvas=function(a){void 0==a&&(a=!0);this.getMapCanvas().draw_canvas(this.getTiles(),this.getWidth(),this.getHeight(),this.getLandPlayerList(),this.getDeploymentLandList(),a)};Map.prototype.select=function(a,b){b?this.getMapCanvas().hilight_origin_land(this.getTiles(),this.getWidth(),this.getHeight(),a):this.getMapCanvas().hilight_destination_land(this.getTiles(),this.getWidth(),this.getHeight(),a)};
Map.prototype.unselect=function(a){a?this.getMapCanvas().unhilight_origin_land():this.getMapCanvas().unhilight_destination_land()};function MapCanvas(){var a=[4,16,20,16,4,0,4],b=[0,0,6,12,12,6,0],d="#CCCCCC,#f8af01,#3760ae,#c22b2b,#5fb61f,#603bb3,#27a7b2,#ad3bac,#814f2e".split(","),e="#CCCCCC,#ffcc00,#296dff,#ed1a1a,#86ce28,#7743ec,#2bb9dd,#ca43ec,#a26136".split(","),g=!0,f,h,i,k;this.getColWidth=function(){return 16};this.getRowHeight=function(){return 12};this.getCanvasMargin=function(){return 30};this.getShapePointX=function(){return a};this.getShapePointY=function(){return b};this.getShapeWidth=function(){return 28};this.getMapDiceTimer=
function(){return f};this.setMapDiceTimer=function(){void 0!=f&&clearInterval(f);var a=this;f=setInterval(function(){a.show_new_die()},100)};this.getTopLayerCanvas=function(){return document.getElementById("canvas_dice")};this.setDelayedDiceArray=function(a){h=a};this.getDelayedDiceArray=function(){return h};this.setLandDicePositions=function(a){i=a};this.getLandDicePositions=function(){return i};this.setDiceCanvasList=function(a){k=a};this.getDiceCanvasList=function(){return k};this.get_first_display=
function(){return g};this.set_first_display=function(a){g=a};this.getPlayerColourFill=function(){return d};this.getPlayerColourStroke=function(){return e}}MapCanvas.prototype.hexToR=function(a){return parseInt(this.cutHex(a).substring(0,2),16)};MapCanvas.prototype.hexToG=function(a){return parseInt(this.cutHex(a).substring(2,4),16)};MapCanvas.prototype.hexToB=function(a){return parseInt(this.cutHex(a).substring(4,6),16)};
MapCanvas.prototype.cutHex=function(a){return"#"==a.charAt(0)?a.substring(1,7):a};MapCanvas.prototype.get_x_from_col=function(a){return this.getColWidth()*a+this.getCanvasMargin()};MapCanvas.prototype.get_y_from_row_col=function(a,b){var d=this.getRowHeight()*a+this.getCanvasMargin();1==b%2&&(d+=this.getRowHeight()/2);return d};
MapCanvas.prototype.getTileIndexFromCoords=function(a,b){if(void 0!=a&&a.constructor===Number&&void 0!=b&&b.constructor===Number){var d=Math.floor((a-this.getCanvasMargin())/this.getColWidth()),e=1==d%2?this.getRowHeight()/2:0,e=Math.floor((b-this.getCanvasMargin()-e)/this.getRowHeight());return[d,e]}return null};
MapCanvas.prototype.draw_shape=function(a,b,d,e,g){d.beginPath();d.moveTo(a+this.getShapePointX()[0],b+this.getShapePointY()[0]);for(var f=1;6>f;f++)d.lineTo(a+this.getShapePointX()[f],b+this.getShapePointY()[f]);d.fillStyle=e;d.fill();null!=g&&(d.strokeStyle=g,d.lineWidth=1,d.stroke());d.closePath()};
MapCanvas.prototype.draw_border=function(a,b,d,e,g,f){d.lineWidth=f;for(f=0;6>f;f++)e>>f&1&&(d.beginPath(),d.strokeStyle=g,d.moveTo(a+this.getShapePointX()[f],b+this.getShapePointY()[f]),d.lineTo(a+this.getShapePointX()[f+1],b+this.getShapePointY()[f+1]),d.stroke(),d.closePath())};
MapCanvas.prototype.draw_tile=function(a,b,d,e,g){var f=this.getPlayerColourStroke()[d],h=this.getPlayerColourFill()[d],i=document.getElementById("canvas_map").getContext("2d");i.lineCap="round";d=this.get_x_from_col(b);a=this.get_y_from_row_col(a,b);i.save();this.draw_shape(d,a,i,h,h);i.clip();this.draw_border(d,a,i,g&35,"rgba(255, 255, 255, 0.25)",2);this.draw_border(d,a,i,g&28,"rgba(0, 0, 0, 0.25)",2);this.draw_border(d,a,i,e,"rgba(255, 255, 255, 0.75)",6);this.draw_border(d,a,i,e,f,4);i.restore()};
MapCanvas.prototype.draw_shadow=function(a,b,d,e){a=e.getContext("2d");a.shadowOffsetX=0;a.shadowOffsetY=3;a.shadowBlur=7;a.shadowColor="rgba(0,0,0,0.4)";b=document.getElementById("canvas_map");b.getContext("2d");a.drawImage(b,0,0,b.width,b.height)};
MapCanvas.prototype.draw_texture=function(a,b,d,e,g){var e=e.getContext("2d"),f,h=e.createPattern(g,"repeat");if(null!=h)for(g=0;g<d;g++)for(f=0;f<b;f++)if(0!=a[g*b+f]){var i=this.get_x_from_col(f),k=this.get_y_from_row_col(g,f);this.draw_shape(i,k,e,h)}};
MapCanvas.prototype.get_adjacent_tile_id=function(a,b,d,e,g,f){var h,i;switch(f){case 0:h=a-1;i=b;break;case 1:h=a-1;i=b+1;break;case 2:h=a;i=b+1;break;case 3:h=a+1;i=b;break;case 4:h=a;i=b-1;break;case 5:h=a-1,i=b-1}1==b%2&&(1==f||2==f||4==f||5==f)&&h++;return i>=e||0>i||h>=g||0>h?null:d[h*e+i]};
MapCanvas.prototype.draw_tiles=function(a,b,d,e){var g,f;for(g=0;g<d;g++)for(f=0;f<b;f++)if(0!=a[g*b+f]){for(var h=a[g*b+f],h=a[g*b+f],i=0,k=0,l=0;6>l;l++){var m=this.get_adjacent_tile_id(g,f,a,b,d,l);m!=h&&(e[m]!=e[h]?i|=1<<l:k|=1<<l)}this.draw_tile(g,f,e[h],i,k)}};MapCanvas.prototype.clear_all=function(){var a=document.getElementById("canvas_map");null!=a&&a.getContext("2d").clearRect(0,0,a.width,a.height)};
MapCanvas.prototype.eraseMap=function(){this.clearDice();this.clear_all();canvas=document.getElementById("canvas_shadow");null!=canvas&&(ctx=canvas.getContext("2d"),ctx.clearRect(0,0,canvas.width,canvas.height));this.set_first_display(!1)};
MapCanvas.prototype.draw_canvas=function(a,b,d,e,g,f){this.draw_tiles(a,b,d,e,document.getElementById("canvas_map"));this.get_first_display()&&(this.draw_shadow(a,b,d,document.getElementById("canvas_shadow")),this.calculate_dice_positions(a,b,d));this.draw_texture(a,b,d,document.getElementById("canvas_map"),document.getElementById("pattern"));this.add_dice(a,b,d,g,e,f);this.set_first_display(!1)};
MapCanvas.prototype.calculate_dice_positions=function(a,b,d){var e=[],g=[];for(r=0;r<d;r++)for(c=0;c<b;c++){var f=a[r*b+c];if(null==e[f]&&0!=f){var h=this.get_centre_row_col(a,b,d,f),i={};i.x=this.get_x_from_col(h[1]);i.y=this.get_y_from_row_col(h[0],h[1]);i.id=f;e[f]=i}}for(element in e)g.push(e[element]);g.sort(function(a,b){return a.y==b.y?a.x-b.x:a.y-b.y});this.setLandDicePositions(g);this.create_dice_layers()};
MapCanvas.prototype.create_dice_layers=function(){for(var a=this.getLandDicePositions(),b=$("#dice_container"),d={},e=0;e<a.length;e++){var g=$(document.createElement("canvas")).attr({id:"dice_canvas_"+a[e].id,width:b.width(),height:b.height()}).css({position:"absolute",left:"0",top:"0","z-index":e});b.append(g);d[a[e].id]=$("#dice_canvas_"+a[e].id)[0]}this.setDiceCanvasList(d)};
MapCanvas.prototype.get_centre_row_col=function(a,b,d,e){var g,f,h=[],i=0,k=[];for(g=0;g<d;g++){var l=0;for(f=0;f<b;f++)a[g*b+f]==e&&l++;l>i?(i=l,h=[],h.push(g)):l==i&&h.push(g)}k[0]=h[Math.round(h.length/2)-1];for(f=0;f<b;f++)if(a[k[0]*b+f]==e){k[1]=f+Math.round(i/2)-1;break}return k};
MapCanvas.prototype.add_dice=function(a,b,d,e,g,f){void 0==f&&(f=!0);for(var h,b=this.get_first_display(),d=[],i=0,k=this.getDiceCanvasList(),l=this.getLandDicePositions(),a=0;a<l.length;a++){var m=l[a].id;if(0!=m&&0<e[m][0]){h=k[m];var n=h.getContext("2d"),o=l[a].x,p=l[a].y,q=e[m][0],x=e[m][1];n.clearRect(0,0,h.width,h.height);var w=Math.floor(g[m]%6+1);for(h=0;h<q;h++){var u=Math.floor(h/4),v=h%4,t=!1;0==v&&(t=!0);var s=!b;if(h<q-x||!f)s=!1;s?(s={},s.x=o+13*u,s.y=p-11*v+7*u,s.val=w,s.shadow=t,s.ctx=
n,s.colour_id=g[m],d[i]=s,i++):this.draw_dice(o+13*u,p-11*v+7*u,w,t,n,g[m])}}}0<d.length&&(this.setMapDiceTimer(),this.setDelayedDiceArray(d))};MapCanvas.prototype.show_new_die=function(){var a=this.getDelayedDiceArray();void 0==a&&clearInterval(this.getMapDiceTimer());void 0!=a&&0<a.length&&(this.draw_dice(a[0].x,a[0].y,a[0].val,a[0].shadow,a[0].ctx,a[0].colour_id),a.splice(0,1),this.setDelayedDiceArray(a),0>=a.length&&clearInterval(this.getMapDiceTimer()))};
MapCanvas.prototype.clearDice=function(){var a=this.getDiceCanvasList(),b=this.getLandDicePositions();for(j=0;j<b.length;j++){var d=b[j].id;0!=d&&(d=a[d],d.getContext("2d").clearRect(0,0,d.width,d.height))}};
MapCanvas.prototype.draw_dice=function(a,b,d,e,g,f){d=$("#dice"+d)[0];e&&(e=$("#dice_shadow")[0],g.drawImage(e,a+2,b+-2));var e=$("#canvas_dice")[0],h=e.getContext("2d"),f=this.getPlayerColourFill()[f],f="rgba("+this.hexToR(f)+","+this.hexToG(f)+","+this.hexToB(f)+",0.4)";e.width=40;e.height=40;h.fillStyle=f;h.drawImage(d,14,4);h.globalCompositeOperation="lighter";h.fillRect(14,4,20,20);h.globalCompositeOperation="destination-in";h.drawImage(d,14,4);g.drawImage(e,a-10,b-10);h.clearRect(0,0,e.width,
e.height)};
MapCanvas.prototype.hilight_land=function(a,b,d,e,g){var f=g.getContext("2d"),h=document.createElement("canvas"),i=h.getContext("2d"),k,l,m,n,o;l=m=n=o=-1;h.width=g.width;h.height=g.height;i.shadowBlur=5;i.shadowColor="rgba(0,0,0,1.0)";for(g=0;g<d;g++)for(k=0;k<b;k++)if(a[g*b+k]==e){var p=this.get_x_from_col(k),q=this.get_y_from_row_col(g,k);if(-1==l||l>p)l=p;if(-1==m||m>q)m=q;n<p&&(n=p);o<q&&(o=q);this.draw_shape(p,q,i,"#000000","#000000")}o+=this.getRowHeight();n+=this.getShapeWidth();l-=i.shadowBlur;
m-=i.shadowBlur;n+=i.shadowBlur;o+=i.shadowBlur;a=l+(n-l)/2;b=m+(o-m)/2;a=f.createRadialGradient(a,b,0,a,b,n-l>o-m?(n-l)/2:(o-m)/2);a.addColorStop(0,"rgba(255, 255, 255, 0.9)");a.addColorStop(1,"rgba(255, 255, 255, 0.5)");f.globalCompositeOperation="source-out";f.drawImage(h,0,0);f.globalCompositeOperation="source-in";f.fillStyle=a;f.fillRect(l,m,n-l,o-m)};MapCanvas.prototype.hilight_origin_land=function(a,b,d,e){0!=e&&this.hilight_land(a,b,d,e,document.getElementById("canvas_hilight_origin"))};
MapCanvas.prototype.hilight_destination_land=function(a,b,d,e){0!=e&&this.hilight_land(a,b,d,e,document.getElementById("canvas_hilight_destination"))};MapCanvas.prototype.unhilight_origin_land=function(){var a=document.getElementById("canvas_hilight_origin");a.getContext("2d").clearRect(0,0,a.width,a.height)};MapCanvas.prototype.unhilight_destination_land=function(){var a=document.getElementById("canvas_hilight_destination");a.getContext("2d").clearRect(0,0,a.width,a.height)};function Player(a,b,d,e){var g=void 0==a?-1:a,f=void 0==b?!1:b,h=void 0==d?"CCCCCC":d,i=void 0==e?0:e;this.getId=function(){return g};this.isUser=function(){return f};this.getColor=function(){return h};this.getSeatId=function(){return i}}Player.prototype.toString=function(){return"[Player]"};Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){var d=this.length,e=Number(b)||0,e=0>e?Math.ceil(e):Math.floor(e);for(0>e&&(e+=d);e<d;e++)if(e in this&&this[e]===a)return e;return-1});function WarSocial(){var a=-1,b=-1,d=[],e=null,g=!1,f=null,h=void 0,i=void 0;this.getPlayerList=function(){return d};this.getCurrentPlayerId=function(){return b};this.setCurrentPlayerId=function(a){b=void 0!=a?a:-1};this.getMap=function(){return e};this.getCanInteract=function(){return g};this.setCanInteract=function(a){g=void 0!=a&&a.constructor===Boolean?a:!1};this.getUserId=function(){return a};this.setUserId=function(b){a=b};this.getDiceBox=function(){return f};this.setAttackFrom=function(a){if(void 0==
a||null!=this.getMap().find_land_by_id(a))h=a};this.getAttackFrom=function(){return h};this.setAttackTo=function(a){if(void 0==a||null!=this.getMap().find_land_by_id(a))i=a};this.getAttackTo=function(){return i};f=new DiceBox;this.create_map=function(a){e=new Map(a.width,a.height,a.land_id_tiles)};this.create_playerList=function(a,b){d=[];for(var e in a)if(null!=a[e]&&void 0!=a[e]&&void 0!=a[e].player_id){var f=!1;void 0!=b&&a[e].player_id==b&&(f=!0);d.push(new Player(a[e].player_id,f,a[e].color,
void 0==a[e].seat_id?a[e].player_id:a[e].seat_id));console.log("playerList : "+d[d.length-1].getSeatId());a[e].is_turn&&this.nextTurn(a[e].player_id)}}}WarSocial.prototype.init=function(a){this.reset();this.create_map(a.map_layout);this.setUserId(a.who_am_i);this.create_playerList(a.players,a.who_am_i);this.deploy(a.deployment);for(var b=0;b<a.players.length;b++)a.players[b].is_turn&&this.nextTurn(a.players[b].player_id);this.addMouseListener()};
WarSocial.prototype.addMouseListener=function(){var a=$("#stage");null!=a&&void 0!=a&&!this.getCanInteract()&&(a.bind("click",this.clickOnCanvas),this.setCanInteract(!0))};WarSocial.prototype.removeMouseListener=function(){var a=$("#stage");null!=a&&void 0!=a&&this.getCanInteract()&&(a.unbind("click"),this.setCanInteract(!1))};
WarSocial.prototype.clickOnCanvas=function(a){var b=$("#stage");if(null!=b&&void 0!=b)var d=a.pageX-$(this).offset().left,e=a.pageY-$(this).offset().top;null!=game&&game.userClicksOnLand(d,e)};
WarSocial.prototype.userClicksOnLand=function(a,b){if(-1!=this.getUserId()&&void 0==this.getAttackTo()&&this.getUserId()==this.getCurrentPlayerId()){var d=this.getMap().getMapCanvas().getTileIndexFromCoords(a,b),d=this.getMap().getLandByCoords(d[0],d[1]),e=this.getMap().find_land_by_id(d),g=null!=e&&null!=e.getOwner()?e.getOwner():null,f=this.getAttackFrom(),h=this.getAttackTo();null!=e&&!(void 0==f&&null!=e&&null!=g&&g.getId()!=this.getUserId())&&!(void 0==f&&null!=e&&null!=g&&g.getId()==this.getUserId()&&
1>=e.getTroops())&&(void 0==f&&null!=e&&null!=g&&g.getId()==this.getUserId()?(this.getMap().select(d,!0),this.setAttackFrom(d)):void 0!=f&&f==d?(this.getMap().unselect(!0),this.setAttackFrom(void 0)):void 0!=f&&void 0==h&&g==this.getMap().find_land_by_id(f).getOwner()&&1<=e.getTroops()?(this.getMap().unselect(!0),this.getMap().select(d,!0),this.setAttackFrom(d)):void 0!=f&&void 0==h&&null!=e&&e.isAdjacentTo(f)&&(this.setAttackTo(d),this.getMap().select(d,!1),this.request_attack()))}};
WarSocial.prototype.request_attack=function(){attack_out(this.getAttackFrom(),this.getAttackTo())};
WarSocial.prototype.attack=function(a){this.removeMouseListener();var b=this.getMap().find_land_by_id(a.attack_info.attacker_land_id).getOwner(),d=this.getMap().find_land_by_id(a.attack_info.defender_land_id).getOwner(),e=0;null!=b&&(e=b.getId());null!=d&&d.getId();var g=this;e!=this.getUserId()&&(this.getMap().select(a.attack_info.attacker_land_id,!0),setTimeout(function(){g.getMap().select(a.attack_info.defender_land_id,!1)},200));e=this.getDiceBox();null!=e&&null!=d&&e.show_dice_box(a.attack_info.attacker_roll,
a.attack_info.defender_roll,b.getSeatId(),d.getSeatId());setTimeout(function(){g.deploy(a.deployment_changes,!1)},400)};WarSocial.prototype.deploy=function(a,b){void 0==b&&(b=!0);var d=this.getMap(),e;for(e in a)if(void 0!=a[e].deployment&&a[e].deployment.constructor===Number&&void 0!=a[e].land_id&&a[e].land_id.constructor===Number){var g=this.find_by_player_by_id(a[e].player_id);null!=g&&d.claim(a[e].land_id,g,a[e].deployment)}this.clear_all();d.drawcanvas(b);next_turn(this.getCurrentPlayerId())};
WarSocial.prototype.nextTurn=function(a){void 0!=a&&(this.removeMouseListener(),this.setCurrentPlayerId(a),this.addMouseListener())};WarSocial.prototype.playerQuit=function(a){if(null!=this.find_by_player_by_id(a))for(var b=this.getMap().find_lands_by_player_id(a),d=0;d<b.length;d++)b[d].setOwner(null);this.removePlayer(a);this.deploy(null)};WarSocial.prototype.find_by_player_by_id=function(a){if(void 0!=a)for(var b=0,d=this.getPlayerList();b<d.length;){if(d[b].getId()==a)return d[b];b++}return null};
WarSocial.prototype.removePlayer=function(a){for(var b=0,d=this.getPlayerList();b<d.length;){if(d[b].getId()==a){d.splice(b,1);break}b++}};WarSocial.prototype.reset=function(){null!=this.getMap()&&void 0!=this.getMap()&&(this.getMap().getMapCanvas().eraseMap(),this.clear_all());this.removeMouseListener();this.setUserId(-1);this.setCurrentPlayerId(-1)};
WarSocial.prototype.clear_all=function(){this.getMap().getMapCanvas().clear_all();this.getMap().unselect(!0);this.getMap().unselect(!1);this.setAttackFrom(void 0);this.setAttackTo(void 0)};
