require 'active/active_game'
require 'active/active_player'
require 'active/active_land'

class HomeController < ApplicationController
  
  def index
    @user = User.new(params[:user])

    name = params[:game_name] == nil ? "home" : params[:game_name]

    @dev = params[:dev] == nil ? false : true
    
    @game = ActiveGame.get_active_game(name)

    if(current_user != nil && current_user.admin?)
      @maps = Map.where("is_public = ?", true).select("name, preview_url")
    else
      @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false).select("name, preview_url")
    end

    @init_data = { :who_am_i => current_user == nil ? 0 : current_user.id,
                   :map_layout => ActiveSupport::JSON.decode(@game.map_json),
                   :players => @game.players.values,
                   :deployment => @game.lands.values }

  end

  def add_line
    game_name = params[:game_name]

    if (params[:entry].strip != "")
      Pusher["presence-" + game_name].trigger(GameMsgType::CHATLINE, {:entry => CGI.escapeHTML(params[:entry]), :name => current_user.username})
    end

    render :text=>"Success", :status=>200
  end

  def create_game
    if (current_user != nil)
      map_name = Map.find_all_by_name(params[:select_map]).empty? ? "default" : params[:select_map]
      number_of_players = [2,3,4,5,6,7].include?(params[:select_players].to_i) ? params[:select_players].to_i : 2
      game_name = nil

      try_name = current_user.username
      try = 1

      while game_name == nil
        gr = GameRule.find_by_game_name(try_name)

        if (gr == nil)
          game_name = try_name
          GameRule.create(:game_name => game_name, :map_name => map_name, :player_count => number_of_players)
        else
          try = try + 1
          try_name = current_user.username + try.to_s
        end
      end

      render :text=>game_name, :status=>200
    else
      render :text=>"Forbidden", :status=>403
    end
  end

  def attack
    game_name = params[:game_name]
    attacking_land_id = params[:atk_land_id]
    defending_land_id = params[:def_land_id]
    
    game = ActiveGame.get_active_game(game_name)
    
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
    
    game = ActiveGame.get_active_game(game_name)
    
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

  def kill_table
    game_name = params[:game_name]

    if (current_user.admin?)
      game = ActiveGame.get_active_game(game_name)

      if (!["home", "default", "alex", "jurgen", "k8dice"].include?(game_name))
        gr = GameRule.find_all_by_game_name(game_name).first

        if gr
          gr.destroy
        end
      end

      game.delete_all

      redirect_to :root
    else
      render :text => "Not authorized", :status => '403'
    end
  end

  def sit
    game_name = params[:game_name]
    
    game = ActiveGame.get_active_game(game_name)

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
    
    game = ActiveGame.get_active_game(game_name)
    
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
    
    game = ActiveGame.get_active_game(game_name)
    
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
      game = ActiveGame.get_active_game(game_name)
      game.force_end_turn
    end
    
    render :text=>"Success", :status=>200
  end

  def get_lobby_games
    if current_user
      games = ActiveGame.get_lobby_games

      response = { :games => games, :online => User.online_user_ids }

      render :json => response
    else
      render :text => "Not authorized", :status => 403
    end
  end
end
