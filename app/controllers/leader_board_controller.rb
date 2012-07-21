require 'active/active_user'
require 'active/active_game'
require 'active/active_player'
require 'active/active_land'

class LeaderBoardController < ApplicationController
  def index
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @player_list = User.order("current_points DESC").page(params[:page]).per(per_page)

    @active_user = nil

    if (current_user != nil)
      @active_user = ActiveUser.get_active_user(current_user.id)

      if (@active_user.layout_id == 2 || params[:test] == "yes")
        render :action => "index", :layout => "application2"
      else
        render :action => "index", :layout => "application"
      end
    else
      render :action => "index", :layout => "application"
    end
  end

  def archived_list
    @season_list = Season.order("created_at DESC").page(params[:page]).per(100)

    @active_user = nil

    if (current_user != nil)
      @active_user = ActiveUser.get_active_user(current_user.id)

      if (@active_user.layout_id == 2 || params[:test] == "yes")
        render :action => "archived_list", :layout => "application2"
      else
        render :action => "archived_list", :layout => "application"
      end
    else
      render :action => "archived_list", :layout => "application"
    end
  end

  def archived_season
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @season = Season.find(params[:season_id])
    @scores = @season.season_scores.order("points DESC").page(params[:page]).per(per_page)

    @active_user = nil

    if (current_user != nil)
      @active_user = ActiveUser.get_active_user(current_user.id)

      if (@active_user.layout_id == 2 || params[:test] == "yes")
        render :action => "archived_season", :layout => "application2"
      else
        render :action => "archived_season", :layout => "application"
      end
    else
      render :action => "archived_season", :layout => "application"
    end
  end

  def all_time
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @player_list = User.order("total_points DESC").page(params[:page]).per(per_page)

    @active_user = nil

    if (current_user != nil)
      @active_user = ActiveUser.get_active_user(current_user.id)

      if (@active_user.layout_id == 2 || params[:test] == "yes")
        render :action => "index", :layout => "application2"
      else
        render :action => "index", :layout => "application"
      end
    else
      render :action => "index", :layout => "application"
    end
  end

  def games_played
    if current_user && current_user.admin?
      @active_user = nil

      if (current_user != nil)
        per_page = 200
        games = REDIS.lrange("games_finished", 0, -1)

        @game_list = Kaminari.paginate_array(games).page(params[:page]).per(per_page)
        @active_user = ActiveUser.get_active_user(current_user.id)

        if (@active_user.layout_id == 2 || params[:test] == "yes")
          render :action => "games_played", :layout => "application2"
        else
          render :action => "games_played", :layout => "application"
        end
      else
        render :action => "games_played", :layout => "application"
      end
    else
      redirect_to :root unless current_user && current_user.admin?
    end
  end

end
