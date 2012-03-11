class HomeController < ApplicationController
  
  def index
    @user = User.new(params[:user])
    name = params[:game_name] == nil ? "home" : params[:game_name]
    map_name = params[:map_name]
    
    @dev = params[:dev] == nil ? false : true
    
    @game = Game.get_game(name, map_name)
    
    @init_data = { :who_am_i => current_user == nil ? 0 : current_user.id, 
                   :map_layout => ActiveSupport::JSON.decode(@game.map.json),
                   :players => @game.players,
                   :deployment => @game.lands }
  end

  def add_line
    game_name = params[:game_name]

    if (params[:entry].strip != "")
      Pusher["presence-" + game_name].trigger(GameMsgType::CHATLINE, {:entry => CGI.escapeHTML(params[:entry]), :name => current_user.username})
    end

    render :text=>"Success", :status=>200
  end
  
  def attack
    game_name = params[:game_name]
    attacking_land_id = params[:atk_land_id]
    defending_land_id = params[:def_land_id]
    
    game = Game.get_game(game_name)
    
    if (game.is_users_turn?(current_user))
      if game.state == Game::STARTED_STATE
        game.attack(attacking_land_id.to_i, defending_land_id.to_i)

        render :text=>"Success", :status=>200
      else
        render :text=>"Game has not started.", :status=>500
      end
    else
      render :text=>"Not your turn", :status=>500
    end
  end
  
  def end_turn
    game_name = params[:game_name]
    
    game = Game.get_game(game_name)
    
    if (game.is_users_turn?(current_user))
      if game.state == Game::STARTED_STATE
        game.end_turn

        render :text=>"Success", :status=>200
      else
        render :text=>"Game has not started.", :status=>500
      end
    else
      render :text=>"Not your turn", :status=>500
    end
  end
  
  def sit
    game_name = params[:game_name]
    
    game = Game.get_game(game_name)

    if (current_user != nil && !game.is_user_in_game?(current_user))
      if game.state == Game::WAITING_STATE
        game.add_player(current_user)
        
        render :text=>"Success", :status=>200
      else
        render :text=>"Game has already started.", :status=>500
      end
    else
      render :text=>"Already in game or not logged in.", :status=>500
    end
  end
  
  def stand
    game_name = params[:game_name]
    
    game = Game.get_game(game_name)
    
    if (game.is_user_in_game?(current_user))
      if game.state == Game::WAITING_STATE
        game.remove_player(current_user)
        
        render :text=>"Success", :status=>200
      else
        render :text=>"Game has already started.", :status=>500
      end
    else
      render :text=>"User not in game", :status=>500
    end
    
  end
  
  def flag
    game_name = params[:game_name]
    
    game = Game.get_game(game_name)
    
    if (game.is_user_in_game?(current_user))
      if game.state == Game::STARTED_STATE
        game.flag_player(current_user)
        
        render :text=>"Success", :status=>200
      else
        render :text=>"Game has not started.", :status=>500
      end
    else
      render :text=>"User not in game", :status=>500
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

  def get_lobby_games
    if current_user
      games = Game.get_lobby_games

      response = { :games => games }

      render :json => response
    else
      render :text => "Not authorized", :status => '403'
    end
  end
end
