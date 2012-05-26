class PusherController < ApplicationController
  protect_from_forgery :except => [:auth, :webhook]

  def webhook
    webhook = Pusher::WebHook.new(request)
    if webhook.valid?
      webhook.events.each do |event|
        case event["name"]
          when "channel_occupied"
            puts "Channel occupied: #{event["channel"]}"
          when "channel_vacated"
            game_name = event["channel"].split("-", 2)[1]

            if (!["home", "default", "alex", "jurgen", "k8dice"].include?(game_name))
              game = ActiveGame.get_active_game(game_name)

              if (game.players.size == 0 && game.state == Game::WAITING_STATE)
                gr = GameRule.find_all_by_game_name(game_name).first

                if gr
                  gr.destroy
                end
                game.delete_all
              end
            end
        end
      end
      render :text => "ok"
    else
      render :text => "invalid", :status => "401"
    end
  end
    
  def auth
    channel = params[:channel_name]

    if current_user

      User.track_user_id({ :user => current_user, :game => params[:channel_name] })

      response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
        :user_id => current_user.id, # => required
        :user_info => { # => optional - for example
          :name => current_user.username
        }
      })
      render :json => response
    else

      response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
          :user_id => "anon", # => required
          :user_info => { }
      })
      render :json => response
    end
  end
end
