module ApplicationHelper
  def js_to_add(type)

    vers = "13"
    cn = controller.controller_name
    ca = controller.action_name

    r = Array.new

    if !Rails.env.development?
      r.push(asset_path("application.js"))

      if type == "game" && !(@dev || @dev_image)
        r.push(asset_path("game.js"))
      end
    else

      r.push("/jquery/jquery-1.7.min.js?v=#{vers}")
      r.push("/jquery/jquery_ujs.js?v=#{vers}")

      # Cloudinary
      r.push("/cloudinary/jquery.ui.widget.js?v=#{vers}")
      r.push("/cloudinary/jquery.iframe-transport.js?v=#{vers}")
      r.push("/cloudinary/jquery.fileupload.js?v=#{vers}")
      r.push("/cloudinary/jquery.cloudinary.js?v=#{vers}")

      # Profile
      r.push("/highcharts/highcharts.js?v=#{vers}")
      r.push("/tweet/jquery.tweet.js?v=#{vers}")
    end

    r.push("/angularjs/angular.min.js?v=#{vers}")
    r.push("/angularjs/services.js?v=#{vers}")
    r.push("/angularjs/game_board.js?v=#{vers}")
    r.push("/angularjs/game_map_info.js?v=#{vers}")
    r.push("/angularjs/game_timer.js?v=#{vers}")
    r.push("/angularjs/game_seats.js?v=#{vers}")
    r.push("/angularjs/game_player.js?v=#{vers}")
    r.push("/angularjs/game_lobby.js?v=#{vers}")
    r.push("/angularjs/game_create.js?v=#{vers}")
    r.push("/angularjs/game_log.js?v=#{vers}")
    r.push("/angularjs/game_chat.js?v=#{vers}")

    r.push("/bootstrap/js/bootstrap.min.js")
    r.push("/utils/utils.js?v=#{vers}")
    r.push("/attachinary/attachinary.js?v=#{vers}")

    if (cn == "posts" || cn == "topics")
      r.push("/mark_it_up/jquery.markitup.js")
      r.push("/mark_it_up/set.js")
    end

    if (cn == "maps")
      r.push("/isotope/jquery.isotope.min.js")

      if (ca == "new" || ca == "edit")
        r.push("/mapcreator/kinetic-v3.js")
        r.push("/mapcreator/map_creator.js")
      end
    end

    if type == "game"
      r.push("http://js.pusher.com/1.12/pusher.min.js")

      if Rails.env.development?
        r.push("/assets/lib/jquery.dataTables.min.js?v=#{vers}")
        r.push("/assets/lib/customSelect.jquery.js")
        r.push("/assets/lib/labelover.js")
        r.push("/assets/lib/ws.app.js?v=#{vers}")
      end

      if Rails.env.development? && !(@dev || @dev_image)
        r.push("/gameboard/game_page2.js?v=#{vers}")
        r.push("/gameboard/communications.js?v=#{vers}")
        r.push("/gameboard/soundmanager.js?v=#{vers}")
        r.push("/gameboard/dicebox.js?v=#{vers}")
        r.push("/gameboard/land.js?v=#{vers}")
        r.push("/gameboard/map.js?v=#{vers}")
        r.push("/gameboard/mapcanvas.js?v=#{vers}")
        r.push("/gameboard/player.js?v=#{vers}")
        r.push("/gameboard/shared.js?v=#{vers}")
        r.push("/gameboard/warsocial.js?v=#{vers}")
        r.push("/gameboard/turn_timer.js?v=#{vers}")
        r.push("/gameboard/settings.js?v=#{vers}")
      elsif @dev || @dev_image || @test

        r.push("/gameboard/game_page2.js?v=#{vers}")

        if @dev || @dev_image
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/communications.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/soundmanager.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/dicebox.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/land.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/map.js?v=#{vers}")
        else
          r.push("/gameboard/communications.js?v=#{vers}")
          r.push("/gameboard/soundmanager.js?v=#{vers}")
          r.push("/gameboard/dicebox.js?v=#{vers}")
          r.push("/gameboard/land.js?v=#{vers}")
          r.push("/gameboard/map.js?v=#{vers}")
        end

        if @dev
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/mapcanvas.js?v=#{vers}")
        elsif @dev_image
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/mapcanvas_sprite.js?v=#{vers}")
        else
          r.push("/gameboard/mapcanvas.js?v=#{vers}")
        end

        if @dev || @dev_image
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/player.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/shared.js?v=#{vers}")
          r.push("http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/warsocial.js?v=#{vers}")
        else
          r.push("/gameboard/player.js?v=#{vers}")
          r.push("/gameboard/shared.js?v=#{vers}")
          r.push("/gameboard/warsocial.js?v=#{vers}")
        end

        r.push("/gameboard/turn_timer.js?v=#{vers}")

        r.push("/gameboard/settings.js?v=#{vers}")

      end
    end

    return r
  end
end
