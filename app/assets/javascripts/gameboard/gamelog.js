
function Lobby(elementId, lobby_maps) {
    this.elementId = elementId;
    this.maps = lobby_maps;
    this._url_prefix = "";

}

Lobby.prototype.setupLobby = function() {
    var ctx = this;

    this._lobby = $('#' + this.elementId);
    this._tabs = this._lobby.find('.tab');
    this._pages = this._lobby.find('.content_page');

    this._pages.hide();

    this._tabs.click(function() {
        $('#lobby_header').removeClass();
        $('#lobby_header').addClass($(this).attr('name'));

        ctx._pages.hide();
        ctx._lobby.find('div.content_page[name="' + $(this).attr('name') + '"]').show();
    });
};

Lobby.prototype.setContext = function(context) {
    if (context == "facebook") {
        this._url_prefix = "/fb";
    }
};

Lobby.prototype.setupDataTables = function() {
    var ctx = this;
    var url_prefix = this._url_prefix;

    this.otable = $('#open_tables').dataTable({
        bJQueryUI: true,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    this.rtable = $('#running_tables').dataTable({
        bJQueryUI: true,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true,
        oLanguage: {
            sEmptyTable: "None"
        }
    });

    /* Add a click handler to the rows - this could be used as a callback */
    $('#open_tables').find("tbody tr").click( function( e ) {
        if (!$(this).hasClass('row_selected') ) {
            ctx.otable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
        }
    });

    /* Add a click handler to the rows - this could be used as a callback */
    $('#running_tables').find("tbody tr").click( function( e ) {
        if (!$(this).hasClass('row_selected') ) {
            ctx.rtable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
        }
    });

    /* Get the rows which are currently selected */
    var fnGetSelected = function( oTableLocal )
    {
        return oTableLocal.$('tr.row_selected');
    };

    /* Add a click handler for the delete row */
    $('#delete').click( function() {
        var anSelected = fnGetSelected( oTable );
        //oTable.fnDeleteRow( anSelected[0] );
    } );

    $('#open_tables_wrapper div:first').hide();
    $('#running_tables_wrapper div:first').hide();

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

    $.each(data.games, function(i, game) {
        var add_to_me = game.state == 'game started' ? $('#running_tables tbody') : $('#open_tables tbody');

        add_to_me.append("<tr><td>" + game.name + "</td><td>" + game.player_count.toString() + "/" + game.max_players + "</td><td>" + game.map + "</td></tr>");
    });

    this._lobby.find('tr').click(function() {
        if($(this).parent().parent().find('tr:first')[0] != $(this)[0]) {
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

    this._lobby.modal({
        opacity:60,
        overlayCss: {
            backgroundColor:"black"
        }
    });

    $(this._tabs[1]).click();
};

Lobby.prototype.close = function() {

};