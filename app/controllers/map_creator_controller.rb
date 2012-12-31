class MapCreatorController < ApplicationController

  def new

    render :action => "map_creator", :layout => "application2"
  end

  def edit

    render :action => "map_creator", :layout => "application2"
  end
end
