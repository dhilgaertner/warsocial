require 'constants/time_series_type'

class ProfileController < ApplicationController

  def index
    @js_page_type = "profile"

    @isGame = false

    if(current_user != nil && current_user.admin?)
      @maps = Map.where("is_public = ?", true)
    else
      @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)
    end

    username = params[:username]
    @user = User.find_by_username(username)
    leader = User.order("current_points DESC").first
    am_i_leader = leader.id == @user.id

    points_ts = TimeSeries.where("name = ? AND key = ?", TimeSeriesType::POINTS, @user.id.to_s).order("created_at DESC").first(10)
    points_ts.reverse!
    points_x = points_ts.collect { |p| p.created_at.strftime("%d") }.push("Now")
    points_me = points_ts.collect { |p| p.value.to_i }.push(@user.current_points)

    if (!am_i_leader)
      lead_ts = TimeSeries.where("name = ? AND key = ?", TimeSeriesType::POINTS, leader.id.to_s).order("created_at DESC").first(10)
      lead_ts.reverse!
      points_lead = lead_ts.collect { |p| p.value.to_i }.push(leader.current_points)
    end

    @h = LazyHighCharts::HighChart.new('graph', style: '') do |f|
      f.options[:title][:text] = "Points"
      f.options[:chart][:width] = 291
      f.options[:chart][:height] = 200
      f.options[:chart][:defaultSeriesType] = "line"
      f.options[:xAxis][:categories] = points_x

      f.series(:type=>"area", :name=>@user.username, :data=> points_me)

      if (!am_i_leader)
        f.series(:name=>"#{leader.username} (leader)", :data=> points_lead)
      end

    end

    render :action => "index", :layout => "application2"
  end

end
