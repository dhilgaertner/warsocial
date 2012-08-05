
function CreateGame(elementId, lobby_maps) {
    var ctx = this;

    this.elementId = elementId;
    this.maps = lobby_maps;
    this._url_prefix = "";

    $('.btn-group').button();

    this._modal = $('#' + this.elementId);

    this.setupCreateGameModal();

    this._modal.on('show', function () {
        if (!$(ctx._modal[0]).is(":visible")) {
            //DO STUFF HERE ONLOAD?
        }
    })
}

CreateGame.prototype.setupCreateGameModal = function() {
    var ctx = this;

    function updateMapInput(element) {
        $('#create_game a.thumbnail.active').removeClass('active');
        $(element).addClass('active');

        var mapName = $(element).data("map");
        $('input[name="select_map"]').val(mapName) ;
    }

    function updateGenericButtonInput(button, inputName) {
        $('input[name="' + inputName + '"]').val($(button).val());
    }

    updateMapInput($('#create_game_maps a.active'));
    updateGenericButtonInput($('#create_game_players button.active'), "select_players");
    updateGenericButtonInput($('#create_game_wager button.active'), "select_wager");
    updateGenericButtonInput($('#create_game_type button.active'), "game_type");

    $('#create_game_maps a').click(function(){
        updateMapInput(this);
    });

    $('#create_game_players button').click(function(){
        updateGenericButtonInput(this, "select_players");
    });

    $('#create_game_wager button').click(function(){
        updateGenericButtonInput(this, "select_wager");
    });

    $('#create_game_type button').click(function(){
        updateGenericButtonInput(this, "game_type");
    });

    $('#create_game_form')
        .bind('ajax:beforeSend', function(xhr, settings) {

        })
        .bind('ajax:success',    function(data, status, xhr) {

        })
        .bind('ajax:complete', function(xhr, status) {
            if (status.status == 200) {
                window.location.href = ctx._url_prefix + "/game/" + status.responseText;
            }
        })
        .bind('ajax:error', function(xhr, status, error) {

        });
};

CreateGame.prototype.setContext = function(context) {
    if (context == "facebook") {
        this._url_prefix = "/fb";
    }
};