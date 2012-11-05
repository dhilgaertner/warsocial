require 'constants/time_series_type'

class ProfileController < ApplicationController

  def index
    @js_page_type = "profile"

    @isGame = false

    if(current_user != nil && current_user.admin?)
      @maps = Map.where("is_public = ?", true).select("name, preview_url")
    else
      @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false).select("name, preview_url")
    end

    username = params[:username]
    @user = User.find_by_username(username)

    points_ts = TimeSeries.where("name = ? AND key = ?", TimeSeriesType::POINTS, @user.id.to_s).order("created_at ASC").first(10)

    @h = LazyHighCharts::HighChart.new('graph', style: '') do |f|
      f.options[:title][:text] = "Points"
      f.options[:chart][:width] = 291
      f.options[:chart][:height] = 200
      f.options[:chart][:defaultSeriesType] = "area"
      f.options[:xAxis][:categories] = points_ts.collect { |p| p.created_at.strftime("%b %d") }
      f.series(:name=>'Points', :data=> points_ts.collect { |p| p.value.to_i })
    end

    place_ts = TimeSeries.where("name = ? AND key = ?", TimeSeriesType::PLACE, @user.id.to_s).order("created_at ASC").first(10)

    @f = LazyHighCharts::HighChart.new('graph', style: '') do |f|
      f.options[:title][:text] = "Place"
      f.options[:chart][:width] = 291
      f.options[:chart][:height] = 200
      f.options[:chart][:defaultSeriesType] = "area"
      f.options[:xAxis][:categories] = place_ts.collect { |p| p.created_at.strftime("%b %d") }
      f.series(:name=>'Place', :data=> place_ts.collect { |p| p.value.to_i })
    end

    render :action => "index", :layout => "application2"
  end

end
