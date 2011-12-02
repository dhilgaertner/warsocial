class HomeController < ApplicationController
  def index
    @user = User.new(params[:user])
  end

  def add_line
    Pusher['home'].trigger(MsgType::CHATLINE, {:entry => params[:entry], :name => current_user.username})

    case params[:entry]
      when "sit"
        game = Game.get_game("home")
    
        if game.state == Game::WAITING_STATE
          game.add_player current_user
        else
          render :text=>"Game has already started.", :status=>500
        end
      when "stand"

      when "attack"
        game = Game.get_game("home")
    
        if game.state == Game::STARTED_STATE
          game.attack current_user
        else
          render :text=>"Game has already started.", :status=>500
        end
    end
    render :text=>"Success", :status=>200
  end
  
  def force_end_turn
    game = Game.get_game("home")
    game.force_end_turn
    
    render :text=>"Success", :status=>200
  end
end
