
function TurnTimer(seat, duration) {
  var ctx = this;
	this._seat = seat;
	this._bar = $($(seat).find(".turn_progress")[0]);
    this._default_width = this._bar.width();
    this._duration = duration;
    this._timer = null;
}

TurnTimer.prototype.restart = function() {
    var ctx = this;
    var time_spent = 0;

    this._bar.width(this._default_width);

    this.stop();

    this._timer = window.setInterval(function () {
        time_spent++;
        ctx._bar.width(ctx._default_width - ((time_spent / ctx._duration) * ctx._default_width));
        if (time_spent >= ctx._duration) {
            clearInterval(ctx._timer);
        }
    }, 1000);
};

TurnTimer.prototype.change_duration = function(duration) {
    this._duration = duration;
};

TurnTimer.prototype.stop = function() {
    clearInterval(this._timer);
    this._bar.width(this._default_width);
};

