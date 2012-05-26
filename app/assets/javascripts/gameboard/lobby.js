
function Lobby(elementId, lobby_maps) {
    var ctx = this;

    this.elementId = elementId;
    this.maps = lobby_maps;
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

//    this._tabs.click(function (e) {
//        e.preventDefault();
//        $(this).tab('show');
//    })
};

Lobby.prototype.setContext = function(context) {
    if (context == "facebook") {
        this._url_prefix = "/fb";
    }
};

Lobby.prototype.setupDataTables = function() {
    var ctx = this;
    var url_prefix = this._url_prefix;

    this.otable = $('#game_lobby #tables table').dataTable({
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    this.otable.fnSort( [ [3,'desc'], [2,'asc'], [1,'asc'] ] );
    this.otable.find('tr:contains("game started")').css("color", "grey")

    $('select.styled').customStyle();

    $('select.styled:first').change(function() {
        $.each(ctx.maps, function(index, map){
            var map_name = $('select.styled:first option:selected').val();
            var clear_bg = function() {
                $('#map_preview').attr("style", "");
            };

            if (map_name == $('select.styled:first option:first').val()) {
                clear_bg();
                return false;
            }

            if (map.name == map_name) {
                if (map.preview_url != null) {
                    $('#map_preview').attr("style", "background: url('" + map.preview_url + "') no-repeat scroll center transparent");
                } else {
                    clear_bg();
                }
            }
        });
    });


    $('#create_game_form')
        .bind('ajax:beforeSend', function(xhr, settings) {

        })
        .bind('ajax:success',    function(data, status, xhr) {

        })
        .bind('ajax:complete', function(xhr, status) {
            if (status.status == 200) {
                window.location.href = url_prefix + "/game/" + status.responseText;
            }
        })
        .bind('ajax:error', function(xhr, status, error) {

        });

};

Lobby.prototype.injectDomData = function(data) {
    var url_prefix = this._url_prefix;

    var add_to_me = $('#tables .table tbody');

    if (this.otable != null) {
        this.otable.fnClearTable();
    }

    $("#tables_badge").text(data.games.length.toString());
    $("#tables_badge").text(data.online.length.toString());

    $.each(data.games, function(i, game) {
        add_to_me.append("<tr><td>" + game.name + "</td><td>" + game.player_count.toString() + "/" + game.max_players + "</td><td>" + game.wager + "</td><td>" + game.state + "</td></tr>");
    });

    var header = this._lobby.find("#tables tr:first")[0];

    this._lobby.find('tr').click(function() {
        if (this != header) {
            window.location.href = url_prefix + "/game/" + $(this).find('td:first').text();
        }
    });
};

Lobby.prototype.open = function() {
    var ctx = this;
    this.setupLobby();

    $.getJSON('/home/get_lobby_games', function(data) {
        ctx.injectDomData(data);
        ctx.setupDataTables();
    });
};