class MapsController < ApplicationController

  def index

    render :action => "index", :layout => "application2"
  end

  def detail

    render :action => "detail", :layout => "application2"
  end

end
