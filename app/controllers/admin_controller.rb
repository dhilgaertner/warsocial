class AdminController < ApplicationController

  def index
    if current_user && current_user.admin?
      render :action => "index", :layout => "application2"
    else
      redirect_to :root unless current_user && current_user.admin?
    end
  end
end
