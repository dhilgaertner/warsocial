
function GameLog(elementId, seats) {
    this._logwindow = $('#' + elementId);
    this._tbody = this._logwindow.find('table tbody');
    this._seats = seats;

    this.setupGameLog();
}

GameLog.prototype.setupGameLog = function() {

};
//Big Jumblies's turn
//abir alayla defeated 8v8, 24 to 20, (1,1,1,2,6,3,6,4 to 2,3,2,1,3,1,4,4)
//+24 dice

GameLog.prototype.logGameStarted = function() {
    this._tbody.append($('<tr><td><div><b>Game started!</b></div></td></tr>'));
    this._logwindow.animate({ scrollTop: this._logwindow.prop("scrollHeight") }, 300);
};

GameLog.prototype.logTurnChange = function(username) {
    var color = this._seats.getColorOrNil(username);
    color = color == null ? "black" : color;


    this._tbody.append($('<tr><td><div class="divider"></div></td></tr>'));
    this._tbody.append($('<tr><td><div><span style="color:{0};"><b>{1}</span>&apos;s turn</b></div></td></tr>'.f(color, username)));
    this._logwindow.animate({ scrollTop: this._logwindow.prop("scrollHeight") }, 300);
};

GameLog.prototype.logGameWinner = function(username) {
    var color = this._seats.getColorOrNil(username);
    color = color == null ? "black" : color;

    this._tbody.append($('<tr><td><div><span style="color:{0};"><b>{1}</span> is the winner!</b></div></td></tr>'.f(color, username)));
    this._logwindow.animate({ scrollTop: this._logwindow.prop("scrollHeight") }, 300);
};

GameLog.prototype.logAttack = function(data) {
    var temp = [];

    var atotal = 0;
    $.each(data.attack_info.attacker_roll ,function() {
        temp.push(this.toString());
        atotal += this;
    });
    var arolls = temp.join(",");

    temp = [];
    var dtotal = 0;
    $.each(data.attack_info.defender_roll ,function() {
        temp.push(this.toString());
        dtotal += this;
    });
    var drolls = temp.join(",");

    var dpid = data.attack_info.defender_player_id;
    var dname = null;
    $.each(data.players ,function() {
        if (this.player_id == dpid) {
            dname = this.name;
        }
    });

    var color = this._seats.getColorOrNil(dname);
    color = color == null ? "black" : color;

    var verb = atotal > dtotal ? "defeated" : "defended";
    var vs = data.attack_info.attacker_roll.length.toString() + "v" + data.attack_info.defender_roll.length.toString();
    var total = '{0} to {1}'.f(atotal, dtotal);
    var rolls = '({0} to {1})'.f(arolls, drolls);

    this._tbody.append($('<tr><td><div><span style="color:{0};"><b>{1}</b></span> {2} {3}, {4}, {5}</div></td></tr>'.f(
        color, dname, verb, vs, total, rolls)));
    this._logwindow.animate({ scrollTop: this._logwindow.prop("scrollHeight") }, 300);
};