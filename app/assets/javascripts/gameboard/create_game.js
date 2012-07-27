
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
            ctx.setupView();
        }
    })
}

CreateGame.prototype.setupCreateGameModal = function() {
    var ctx = this;

    this._modal.find('select.styled:first').change(function() {
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
                window.location.href = ctx._url_prefix + "/game/" + status.responseText;
            }
        })
        .bind('ajax:error', function(xhr, status, error) {

        });
};

CreateGame.prototype.setupView = function() {

};

CreateGame.prototype.setContext = function(context) {
    if (context == "facebook") {
        this._url_prefix = "/fb";
    }
};