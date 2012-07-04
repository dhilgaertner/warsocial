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
end
