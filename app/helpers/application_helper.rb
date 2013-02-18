module ApplicationHelper
  def js_to_add(type)

    vers = "12"
    cn = controller.controller_name
    ca = controller.action_name

    r = Array.new

    r.push("/angularjs/angular.min.js?v=#{vers}")
    r.push("/angularjs/game_lobby/game_lobby.js?v=#{vers}")

    if !Rails.env.development?
      r.push(asset_path("application.js"))

      if type == "game" && !(@dev || @dev_image || @test)
        r.push(asset_path("game.js"))
      end
    else

      r.push("/jquery/jquery-1.7.min.js?v=#{vers}")
      r.push("/jquery/jquery_ujs.js?v=#{vers}")
      r.push("/gameboard/lobby.js?v=#{vers}")
      r.push("/gameboard/create_game.js?v=#{vers}")

      # Profile
      r.push("/highcharts/highcharts.js?v=#{vers}")
      r.push("/tweet/jquery.tweet.js?v=#{vers}")
    end

    r.push("/bootstrap/js/bootstrap.min.js")

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

      if Rails.env.development? && !(@dev || @dev_image || @test)
        r.push("/gameboard/game_page.js?v=#{vers}")
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
        r.push("/gameboard/seats.js?v=#{vers}")
        r.push("/gameboard/chatbox.js?v=#{vers}")
        r.push("/gameboard/gamelog.js?v=#{vers}")
      elsif @dev || @dev_image || @test

        if @test
          r.push("/gameboard/game_page2.js?v=#{vers}")
        else
          r.push("/gameboard/game_page.js?v=#{vers}")
        end

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
        if @test
          r.push("/gameboard/seats2.js?v=#{vers}")
          r.push("/gameboard/settings.js?v=#{vers}")
        else
          r.push("/gameboard/seats.js?v=#{vers}")
        end
        r.push("/gameboard/chatbox.js?v=#{vers}")
        r.push("/gameboard/gamelog.js?v=#{vers}")

      end
    end

    return r
  end
end
