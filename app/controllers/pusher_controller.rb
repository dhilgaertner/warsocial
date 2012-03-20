class PusherController < ApplicationController
  protect_from_forgery :except => [:auth, :webhook]

  def webhook
    webhook = Pusher::WebHook.new(request)
    if webhook.valid?
      webhook.events.each do |event|
        case event["name"]
          when "channel_occupied"
            logger.info "Channel occupied: #{event["channel"]}"
            puts "Channel occupied: #{event["channel"]}"
          when "channel_vacated"
            puts "Channel vacated: #{event["channel"]}"
            logger.info "Channel vacated: #{event["channel"]}"
        end
      end
      render :text => "ok"
    else
      render :text => "invalid", :status => "401"
    end
  end
    
  def auth
    if current_user
      channel = params[:channel_name]

      #User.track_user_id({ :userId => current_user.id, :game => params[:channel_name] })

      response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
        :user_id => current_user.id, # => required
        :user_info => { # => optional - for example
          :name => current_user.username
        }
      })
      render :json => response
    else
      render :text => "Not authorized", :status => '403'
    end
  end
end
