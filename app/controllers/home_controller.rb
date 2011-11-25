class HomeController < ApplicationController
  def index
    @user = User.new(params[:user])
  end

  def add_line
      @update = {:entry => params[:entry], :name => current_user.username}

      Pusher['home'].trigger('new_chat_line', @update)

      render :text=>"Success", :status=>200
  end
end
