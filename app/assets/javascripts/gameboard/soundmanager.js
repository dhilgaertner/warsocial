var maxchannels = 10;
var SoundManager = new SoundManager();

function SoundManager()
{
    var are_sounds_on = true;

    this.sounds = new Array();

    this.init = function ()
    {
        this.ext = "";

        var audio = new Audio();

        if (audio.canPlayType('audio/mpeg')) this.ext = ".mp3";
        if (audio.canPlayType('audio/ogg')) this.ext = ".ogg";
    }

    this.soundsToggle = function(isOn) {
        are_sounds_on = isOn;
    }

    this.play = function(effectname){

        if (!are_sounds_on) return;

        var snd = null;

        switch(effectname) {
            case "game_start":
                snd = new Audio("/sounds/start2" + this.ext);
                break;
            case "sound_click":
                snd = new Audio("/sounds/click" + this.ext);
                break;
            case "my_turn":
                snd = new Audio("/sounds/turn" + this.ext);
                break;
            case "loss_roll":
                snd = new Audio("/sounds/loss" + this.ext);
                break;
            case "win_roll":
                snd = new Audio("/sounds/win" + this.ext);
                break;
            case "roll":
                return;
                snd = new Audio("/sounds/roll" + this.ext);
                break;
            default:
                return;
        }

        snd.play();
    }

}
