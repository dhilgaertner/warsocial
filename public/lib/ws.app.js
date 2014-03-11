
function ws_init() {

    $('#setting-layout button').click(function() {
        var layout_id = $(this).val();

        $.post(urls.settings_toggle_layout_url, { layout_id: layout_id });
    });

    $('#setting-sounds button').click(function() {
        var sounds = $(this).val() == 'true';

        if (typeof sounds_toggle !== 'undefined') {
            sounds_toggle(sounds);
        }

        $.post(urls.settings_toggle_sounds_url, { on: sounds });
    });

}