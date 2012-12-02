
function ws_init() {

    $('#setting-sounds button').click(function() {
        var sounds = $(this).val() == 'true';

        if (typeof sounds_toggle !== 'undefined') {
            sounds_toggle(sounds);
        }

        $.post(urls.settings_toggle_sounds_url, { on: sounds });
    });

}