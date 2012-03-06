var maxchannels = 10;
var SoundManager = new SoundManager();


function SoundManager()
{
  this.sounds = new Array();
      
  this.init = function ()
    {
        var audio = $("audio");
        for(var i=0;i<audio.length;i++){
       
          this.sounds[audio[i].id] = new Array();
					
          for(var j=0; j<maxchannels; j++)
          {
						var src;
							// choose the right source depending on what the browser can play
						if (audio[i].canPlayType('audio/mpeg')) {
							src = $("#" + audio[i].id + " source[type='audio/mpeg']").attr("src");				
						} 
						else if (audio[i].canPlayType('audio/ogg')){
								src = $("#" + audio[i].id + " source[type='audio/ogg']").attr("src");				
						}
						else {
							// fall back
						}
            this.sounds[audio[i].id][j] = new Audio(src);
						this.sounds[audio[i].id][j].is_playing = false;
          }
        }
    }
    
  this.play = function(effectname){

        for(var i=0; i < maxchannels; i++)
        {
          if(this.sounds[effectname][i].ended == true || this.sounds[effectname][i].is_playing == false)
          {
            this.sounds[effectname][i].play();
						this.sounds[effectname][i].is_playing = true;
						//console.log("play: " + effectname + " " + i);
            return;
          }
        }
    }
   
}
