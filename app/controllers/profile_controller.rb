class ProfileController < ApplicationController

  def index
    username = params[:username]
    @user = User.find_by_username(username)

    if (current_user.forem_admin)
      render :action => "index", :layout => "application2"
    else
      redirect_to home_index_url
    end

  end

end
