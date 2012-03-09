var maxchannels = 10;
var SoundManager = new SoundManager();


function SoundManager()
{
    this.sounds = new Array();

    this.init = function ()
    {
        this.ext = "";

        var audio = new Audio();

        if (audio.canPlayType('audio/mpeg')) this.ext = ".mp3";
        if (audio.canPlayType('audio/ogg')) this.ext = ".ogg";
    }

    this.play = function(effectname){
        var snd = null;

        switch(effectname) {
            case "game_start":
                snd = new Audio("/sounds/start" + this.ext);
                break;
            case "sound_click":
                return;
                //snd = new Audio("/sounds/click" + this.ext);
                break;
            default:
                return;
        }

        snd.play();
    }

}
