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

    @h = LazyHighCharts::HighChart.new('graph', style: '') do |f|
      f.options[:title][:text] = "Points"
      f.options[:chart][:width] = 300
      f.options[:chart][:height] = 200
      f.options[:chart][:defaultSeriesType] = "area"
      f.options[:plotOptions] = {areaspline: {pointInterval: 1.day, pointStart: 10.days.ago}}
      f.series(:name=>'Points', :data=> [1, 3, 4, 3, 3, 5, 4,6,7,8,8,9,9,10,14,18,20,25])
      f.xAxis(type: :datetime)
    end

    render :action => "index", :layout => "application2"
  end

end
