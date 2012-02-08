class HomeController < ApplicationController
  def index
    @user = User.new(params[:user])
    name = params[:game_name] == nil ? "home" : params[:game_name]
    
    @dev = params[:dev] == nil ? false : true
    
    @game = Game.get_game(name)
    
    @init_data = { :who_am_i => 0, 
                   :map_layout => ActiveSupport::JSON.decode(@game.map.json),
                   :players => Array.new,
                   :deployment => Array.new }
  end

  def add_line
    game_name = params[:game_name]
    
    Pusher[game_name].trigger(GameMsgType::CHATLINE, {:entry => params[:entry], :name => current_user.username})

    case params[:entry]
      when "sit"
        game = Game.get_game(game_name)
    
        if game.state == Game::WAITING_STATE
          game.add_player current_user
        else
          render :text=>"Game has already started.", :status=>500
        end
    end
    render :text=>"Success", :status=>200
  end
  
  def attack()
    game_name = params[:game_name]
    attacking_land_id = params[:atk_land_id]
    defending_land_id = params[:def_land_id]
    
    game = Game.get_game(game_name)
    
    if game.state == Game::STARTED_STATE
      game.attack(attacking_land_id.to_i, defending_land_id.to_i)
      
      render :text=>"Success", :status=>200
    else
      render :text=>"Game is not in started state.", :status=>500
    end
  end
  
  def force_end_turn
    auth = params[:auth]
    game_name = params[:game_name]
    
    if auth == "whisper" #TODO: Better auth (Dustin)
      game = Game.get_game(game_name)
      game.force_end_turn
    end
    
    render :text=>"Success", :status=>200
  end
end
