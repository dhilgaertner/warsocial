
function ChatBox(elementId) {
    this._chatwindow = $('#' + elementId);
    this._tbody = this._chatwindow.find('table tbody');

    this.setupChatBox();
}

ChatBox.prototype.setupChatBox = function() {

};

ChatBox.prototype.addChatLine = function(username, message, color) {
    this._tbody.append($('<tr><td><span style="color: ' + color + ';"><b>' + username + '</b></span>: ' + message + '</td></tr>'));
    this._chatwindow.animate({ scrollTop: this._chatwindow.prop("scrollHeight") }, 300);
};