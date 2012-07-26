
function Lobby(elementId) {
    var ctx = this;

    this.elementId = elementId;
    this._url_prefix = "";

    this._lobby = $('#' + this.elementId);
    this._tabs = this._lobby.find('nav-tabs a');

    this._lobby.on('show', function () {
        if (!$(ctx._lobby[0]).is(":visible")) {
            ctx.open();
        }
    })
}

Lobby.prototype.setupLobby = function() {
    var ctx = this;
};

Lobby.prototype.setContext = function(context) {
    if (context == "facebook") {
        this._url_prefix = "/fb";
    }
};

Lobby.prototype.setupDataTables = function() {
    var ctx = this;
    var url_prefix = this._url_prefix;

    this.ttable = $('#game_lobby #tables table').dataTable({
        iDisplayLength: 100,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    this.ttable.fnSort( [ [3,'desc'], [2,'asc'], [1,'desc'] ] );
    this.ttable.find('tr:contains("game started")').css("color", "grey")

    this.mtable = $('#game_lobby #multi-day table').dataTable({
        iDisplayLength: 100,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    this.mtable.fnSort( [ [3,'desc'], [2,'asc'], [1,'desc'] ] );
    this.mtable.find('tr:contains("game started")').css("color", "grey")

    this.otable = $('#game_lobby #online table').dataTable({
        iDisplayLength: 100,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    this.otable.fnSort( [ [0,'asc'] ] );
    this.otable.css("width", "");

};

Lobby.prototype.injectDomData = function(data) {
    var url_prefix = this._url_prefix;

    if (this.ttable != null) {
        this.ttable.fnClearTable();
    }

    if (this.mtable != null) {
        this.mtable.fnClearTable();
    }

    if (this.otable != null) {
        this.otable.fnClearTable();
    }

    $("#tables_badge").text(data.games.length.toString());
    $("#online_badge").text(data.online.length.toString());

    var add_to_me = $('#tables .table tbody');

    $.each(data.games, function(i, game) {
        add_to_me.append("<tr><td>" + game.name + "</td><td>" + game.player_count.toString() + "/" + game.max_players + "</td><td>" + game.wager + "</td><td>" + game.state + "</td></tr>");
    });

    add_to_me = $('#multi-day .table tbody');

    //$.each(data.multiday, function(i, game) {
    //    add_to_me.append("<tr><td>" + game.name + "</td><td>" + game.player_count.toString() + "/" + game.max_players + "</td><td>" + game.wager + "</td><td>" + game.state + "</td></tr>");
    //});

    add_to_me = $('#online .table tbody');

    $.each(data.online, function(i, user) {
        add_to_me.append("<tr><td>" + user.username + "</td><td>" + user.current_points.toString() + "</td><td>" + user.location + "</td></tr>");
    });

    var header_tables = this._lobby.find("#tables tr:first")[0];
    var header_multiday = this._lobby.find("#multi-day tr:first")[0];
    var header_online = this._lobby.find("#online tr:first")[0];

    this._lobby.find('#tables tr').click(function() {
        if (this != header_tables) {
            window.location.href = url_prefix + "/game/" + $(this).find('td:first').text();
        }
    });

    this._lobby.find('#multi-day tr').click(function() {
        if (this != header_multiday) {
            window.location.href = url_prefix + "/game/" + $(this).find('td:first').text();
        }
    });

    this._lobby.find('#online tr').click(function() {
        if (this != header_online) {
            window.location.href = url_prefix + "/game/" + $(this).find('td:last').text();
        }
    });
};

Lobby.prototype.open = function() {
    var ctx = this;
    this.setupLobby();

    $.getJSON('/home/get_lobby_games', function(data) {
        ctx.injectDomData(data);
        ctx.setupDataTables();
        ctx._lobby.find('.dataTables_paginate').hide();
    });
};