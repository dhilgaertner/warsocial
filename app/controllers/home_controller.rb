require 'active/game/active_game_factory'
require 'active/game/active_game_normal'
require 'active/game/active_game_multi_day'
require 'active/active_player'
require 'active/active_land'
require 'active/active_user'

class HomeController < ApplicationController
  layout :resolve_layout

  def index2

  end

  def index

    @js_page_type = "game"

    @isGame = true

    @user = User.new(params[:user])

    if (params[:game_name] == nil)
      lobby_games = ActiveGameNormal.get_lobby_games(current_user)
      running_games = lobby_games.select { |game| game[:state] == Game::STARTED_STATE }
      name = running_games.empty? ? "home" : running_games.first[:name]
    else
      name = params[:game_name]
    end

    @dev = params[:dev] == nil ? false : true
    @dev_image = params[:dev_image] == nil ? false : true

    @game = ActiveGameFactory.get_active_game(name)

    if(current_user != nil && current_user.admin?)
      @maps = Map.where("is_public = ?", true).select("name, preview_url")
    else
      @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false).select("name, preview_url")
    end

    @init_data = { :who_am_i => current_user == nil ? 0 : current_user.id,
                   :map_layout => ActiveSupport::JSON.decode(@game.map_json),
                   :players => @game.players.values,
                   :deployment => @game.lands.values }

    @active_user = nil

    if (current_user != nil)
      @active_user = ActiveUser.get_active_user(current_user.id)

      @test = (params[:test] == "yes" || @active_user.layout_id == 1) ? true : false

      if (@test)
        render :action => "index2", :layout => "application2"
      else
        render :action => "index", :layout => "application"
      end
    else
      render :action => "index", :layout => "application"
    end
  end

  def add_line
    game_name = params[:game_name]

    if (params[:entry].strip != "")
      Pusher["presence-" + game_name].trigger(GameMsgType::CHATLINE, {:entry => CGI.escapeHTML(params[:entry]), :name => current_user.username})

      REDIS.multi do
        User.track_user_id({ :user_id => current_user.id, :game => game_name })
        REDIS.rpush("chat_logs", "(#{game_name})#{current_user.username}:#{CGI.escapeHTML(params[:entry])}")
      end
    end

    render :text=>"Success", :status=>200
  end

  def create_game
    if (current_user != nil)
      map_name = Map.find_all_by_name(params[:select_map]).empty? ? "default" : params[:select_map]
      number_of_players = [2,3,4,5,6,7].include?(params[:select_players].to_i) ? params[:select_players].to_i : 2
      wager = [0,50,100,200,500,1000,2000,5000,10000].include?(params[:select_wager].to_i) ? params[:select_wager].to_i : 0
      game_type = ["normal", "multiday"].include?(params[:game_type]) ? params[:game_type] : "normal"

      game_name = nil

      try_name = current_user.username
      try = 1

      while game_name == nil
        gr = GameRule.find_by_game_name(try_name)

        if (gr == nil)
          game_name = try_name
          GameRule.create(:game_name => game_name,
                          :map_name => map_name,
                          :player_count => number_of_players,
                          :wager_level => wager,
                          :game_type => game_type)
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
    if (current_user != nil)
      game_name = params[:game_name]
      attacking_land_id = params[:atk_land_id]
      defending_land_id = params[:def_land_id]

      game = ActiveGameFactory.get_active_game(game_name)

      if (game.is_users_turn?(current_user))
        if game.state == Game::STARTED_STATE
          game.attack(attacking_land_id.to_i, defending_land_id.to_i)

          render :text=>"Success", :status=>200
        else
          render :text=>"Game has not started.", :status=>403
        end
      else
        render :text=>"Not your turn", :status=>403
      end
    else
      render :text=>"Not logged in", :status=>403
    end

  end
  
  def end_turn
    if (current_user != nil)
      game_name = params[:game_name]

      game = ActiveGameFactory.get_active_game(game_name)

      if (game.is_users_turn?(current_user))
        if game.state == Game::STARTED_STATE
          game.end_turn

          render :text=>"Success", :status=>200
        else
          render :text=>"Game has not started.", :status=>403
        end
      else
        render :text=>"Not your turn", :status=>403
      end
    else
      render :text=>"Not logged in", :status=>403
    end
  end

  def kill_table
    game_name = params[:game_name]

    if (current_user.admin?)
      game = ActiveGameFactory.get_active_game(game_name)

      if (!["home", "theonering", "texas", "k8dice", "skullhead",
            "home100", "theonering100", "texas100", "k8dice100", "skullhead100",
            "seeb500", "texas500",
            "seeb2k", "texas2k",
            "seeb10k", "texas10k"].include?(game_name))
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
    
    game = ActiveGameFactory.get_active_game(game_name)

    if (current_user != nil)
      if(!game.is_user_in_game?(current_user))
        if game.state == Game::WAITING_STATE
          if game.can_i_afford_it?(current_user)
            game.add_player(current_user)

            render :text=>"success", :status=>200
          else
            render :text=>"not_enough_points", :status=>500
          end
        else
          render :text=>"game_started", :status=>500
        end
      else
        render :text=>"already_in_game", :status=>500
      end
    else
      render :text=>"not_logged_in", :status=>500
    end
  end
  
  def stand

    if (current_user != nil)
      game_name = params[:game_name]

      game = ActiveGameFactory.get_active_game(game_name)

      if (game.is_user_in_game?(current_user))
        if game.state == Game::WAITING_STATE
          game.remove_player(current_user)

          render :text=>"Success", :status=>200
        else
          render :text=>"Game has already started.", :status=>403
        end
      else
        render :text=>"User not in game", :status=>403
      end
    else
      render :text=>"Not logged in", :status=>403
    end

  end
  
  def flag
    game_name = params[:game_name]
    
    game = ActiveGameFactory.get_active_game(game_name)
    
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
    turn_count = params[:turn_count].to_i

    if auth == "whisper" #TODO: Better auth (Dustin)
      game = ActiveGameFactory.get_active_game(game_name)
      if (game.turn_count == turn_count)
        game.force_end_turn
      end
    end
    
    render :text=>"Success", :status=>200
  end

  def get_lobby_games
    games = ActiveGameNormal.get_lobby_games(current_user)
    multiday_games = ActiveGameMultiDay.get_lobby_games(current_user)

    response = { :games => games, :online => User.online_users, :multiday => multiday_games }

    render :json => response
  end

  def sign_up_confirmation

  end

  private
  def resolve_layout
    case action_name
      when "index"
        if (params[:test] == "yes")
          "application2"
        else
          "application"
        end
      else
        "application"
    end
  end
end
