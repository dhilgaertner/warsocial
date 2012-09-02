
function ws_init() {

    $('#setting-layout button').click(function() {
        var layout_id = $(this).val();

        $.post(urls.settings_toggle_layout_url, { layout_id: layout_id });
    });

}