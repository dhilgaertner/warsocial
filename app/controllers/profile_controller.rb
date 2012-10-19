class ProfileController < ApplicationController

  def index
    username = params[:username]
    @user = User.find_by_username(username)

    render :action => "index", :layout => "application2"
  end

end
