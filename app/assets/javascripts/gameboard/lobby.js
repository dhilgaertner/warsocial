
function Lobby(elementId) {
    this.elementId = elementId;
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

Lobby.prototype.setupDataTables = function() {
    var ctx = this;

    this.otable = $('#open_tables').dataTable({
        bJQueryUI: true,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true
    });

    this.rtable = $('#running_tables').dataTable({
        bJQueryUI: true,
        bFilter: false,
        bInfo: false,
        bLengthChange: false,
        bDestroy: true
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
};

Lobby.prototype.injectDomData = function(data) {
    $.each(data.games, function(i, game) {
        var add_to_me = game.state == 'game started' ? $('#running_tables tbody') : $('#open_tables tbody');

        add_to_me.append("<tr><td>" + game.name + "</td><td>" + game.players.length.toString() + "/" + game.max_players + "</td><td>" + game.map + "</td>");
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
};

Lobby.prototype.close = function() {

};
