class MapCreatorController < ApplicationController

  def new
    @js_page_type = "maps"

    render :action => "map_creator", :layout => "application2"
  end

  def edit
    @js_page_type = "maps"

    render :action => "map_creator", :layout => "application2"
  end
end
