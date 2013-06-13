
function Settings(elementId) {
    var ctx = this;

    this.elementId = elementId;

    this._modal = $('#' + this.elementId);

    this.setupSettingsModal();

    this._modal.on('show', function () {
        if (!$(ctx._modal[0]).is(":visible")) {
            //DO STUFF HERE ONLOAD?
        }
    })
}

Settings.prototype.setupSettingsModal = function() {

};