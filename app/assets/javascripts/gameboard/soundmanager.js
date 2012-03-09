var maxchannels = 10;
var SoundManager = new SoundManager();


function SoundManager()
{
    this.sounds = new Array();

    this.init = function ()
    {
        this.ext = "";

        this.ext = Audio().canPlayType('audio/mpeg') ? ".mp3" : this.ext;
        this.ext = Audio().canPlayType('audio/ogg') ? ".ogg" : this.ext;
    }

    this.play = function(effectname){
        var snd = null;

        switch(effectname) {
            case "game_start":
                snd = new Audio("/sounds/start" + this.ext);
                break;
            case "sound_click":
                snd = new Audio("/sounds/click" + this.ext);
                break;
            default:
                return;
        }

        snd.play();
    }

}
