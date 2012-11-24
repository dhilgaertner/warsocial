module AdminHelper

  def games_played_chart
    g = ArchivedGame.all.group_by{ |g| g.created_at.beginning_of_day }
    data = []

    g.each do |key, value|
      data.push([key.utc.to_i * 1000, value.count])
    end

    chart = LazyHighCharts::HighChart.new('graph', style: '') do |f|
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
end
