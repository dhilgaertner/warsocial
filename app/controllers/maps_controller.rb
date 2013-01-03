class MapsController < ApplicationController

  def index

    @maps = Map.all
    @map_counts = ArchivedGame.map_usage_counts

    render :action => "index", :layout => "application2"
  end

  def detail
    map_id = params[:map_id]

    @map = Map.find(map_id.to_i)

    render :action => "detail", :layout => "application2"
  end

end
