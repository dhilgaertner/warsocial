require 'active/active_user'
require 'active/active_player'
require 'active/active_land'

class LeaderBoardController < ApplicationController
  def index
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @player_list = User.where("current_points > 0").order("current_points DESC").page(params[:page]).per(per_page)

    @active_user = nil

    @h = top_10_chart

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
    @scores = @season.season_scores.where("points > 0").order("points DESC").page(params[:page]).per(per_page)

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

  private
  def top_10_chart
    leaders = User.order("current_points DESC").first(10)
    data = Array.new

    leaders.each do |u|
      ts = TimeSeries.where("name = ? AND key = ?", TimeSeriesType::POINTS, u.id.to_s).order("created_at ASC").first(10)
      data.push(create_top10_series_data(ts, u))
    end

    chart = LazyHighCharts::HighChart.new('graph', style: '') do |f|
      f.options[:title][:text] = "Top 10"
      #f.options[:chart][:width] = 500
      f.options[:chart][:height] = 400
      f.options[:chart][:defaultSeriesType] = "line"
      f.options[:xAxis][:categories] = data.first[:x_data]
      f.options[:legend][:layout] = "horizontal"
      data.each do |d|
        f.series(:type=>"line", :name=>d[:user].username, :data=> d[:y_data])
      end
    end

    return chart
  end

  private
  def create_top10_series_data(time_series, user)
    points_x = time_series.collect { |p| p.created_at.strftime("%b %d") }.push("Now")
    points_y = time_series.collect { |p| p.value.to_i }.push(user.current_points)

    data = {
      :user => user,
      :x_data => points_x,
      :y_data => points_y
    }
  end
end
