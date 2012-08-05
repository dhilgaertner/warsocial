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

            permenant_games = ["home", "theonering", "texas", "k8dice", "skullhead",
                               "home100", "theonering100", "texas100", "k8dice100", "skullhead100",
                               "seeb500", "texas500",
                               "seeb2k", "texas2k",
                               "seeb10k", "texas10k"]

            if (!permenant_games.include?(game_name))
              game = ActiveGameFactory.get_active_game(game_name)

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

      game_name = params[:channel_name].split("-", 2)[1]

      REDIS.multi do
        User.track_user_id({ :user_id => current_user.id, :game => game_name })
      end

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
