
function ChatBox(elementId, seats) {
    this._chatwindow = $('#' + elementId);
    this._tbody = this._chatwindow.find('table tbody');
    this._seats = seats;

    this.setupChatBox();
}

ChatBox.prototype.setupChatBox = function() {

};

ChatBox.prototype.addChatLine = function(username, message) {
    var color = this._seats.getColorOrNil(username);
    color = color == null ? "black" : color;

    this._tbody.append($('<tr><td><span style="color: ' + color + ';"><b>' + username + '</b></span>: ' + message + '</td></tr>'));
    this._chatwindow.animate({ scrollTop: this._chatwindow.prop("scrollHeight") }, 300);
};