module AdminHelper

  def games_played_chart
    g = ArchivedGame.all.group_by{ |g| g.created_at.beginning_of_day }
    data = []

    g.each do |key, value|
      data.push([key.utc.to_i * 1000, value.count])
    end

    chart = LazyHighCharts::HighChart.new('graph') do |f|
      f.options[:title][:text] = "Games Played"
      #f.options[:chart][:width] = 600
      f.options[:chart][:height] = 400
      f.options[:chart][:defaultSeriesType] = "column"
      #f.options[:xAxis][:categories] = data.first[:x_data]
      f.options[:xAxis][:type] = "datetime"
      f.options[:xAxis][:dateTimeLabelFormats] = { :month => "%b %e", :week => "%b %e", :day => "%b %e" }
      f.options[:legend][:layout] = "horizontal"
      f.series(:type=>"column", :name=>"Games", :data=> data)
    end

    return chart
  end

  def monthly_active_users_chart(how_long=nil)
    ts = TimeSeries.where("name = ?", TimeSeriesType::MONTHLY_ACTIVE_USERS).order("created_at DESC")
    ts = how_long != nil ? ts.first(how_long) : ts
    ts.reverse!

    chart = LazyHighCharts::HighChart.new('graph') do |f|
      f.options[:title][:text] = "Monthly Active Users"
      #f.options[:chart][:width] = 600
      f.options[:chart][:height] = 400
      f.options[:chart][:defaultSeriesType] = "line"
      #f.options[:xAxis][:categories] = data.first[:x_data]
      f.options[:xAxis][:type] = "datetime"
      f.options[:xAxis][:dateTimeLabelFormats] = { :month => "%b %e", :week => "%b %e", :day => "%b %e" }
      f.options[:legend][:layout] = "horizontal"
      f.series(:type=>"line", :name=>"Users", :data=> create_time_series_data(ts))
    end

    return chart
  end

  def weekly_active_users_chart(how_long=nil)
    ts = TimeSeries.where("name = ?", TimeSeriesType::WEEKLY_ACTIVE_USERS).order("created_at DESC")
    ts = how_long != nil ? ts.first(how_long) : ts
    ts.reverse!

    chart = LazyHighCharts::HighChart.new('graph') do |f|
      f.options[:title][:text] = "Weekly Active Users"
      #f.options[:chart][:width] = 600
      f.options[:chart][:height] = 400
      f.options[:chart][:defaultSeriesType] = "line"
      #f.options[:xAxis][:categories] = data.first[:x_data]
      f.options[:xAxis][:type] = "datetime"
      f.options[:xAxis][:dateTimeLabelFormats] = { :month => "%b %e", :week => "%b %e", :day => "%b %e" }
      f.options[:legend][:layout] = "horizontal"
      f.series(:type=>"line", :name=>"Users", :data=> create_time_series_data(ts))
    end

    return chart
  end

  private
  def create_time_series_data(time_series)
    data = time_series.collect { |p| [p.created_at.utc.to_i * 1000, p.value.to_i] }

    return data
  end
end
