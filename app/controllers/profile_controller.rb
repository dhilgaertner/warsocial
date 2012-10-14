class ProfileController < ApplicationController

  def index
    render :action => "index", :layout => "application2"
  end

end
