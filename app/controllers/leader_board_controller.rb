class LeaderBoardController < ApplicationController
  def index
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @player_list = User.order("current_points DESC").page(params[:page]).per(per_page)
  end

  def all_time
    page = params[:page] == nil ? 1 : params[:page].to_i
    per_page = 100

    @rank_start = ((page - 1) * per_page) + 1
    @player_list = User.order("total_points DESC").page(params[:page]).per(per_page)
  end
end
