module ApplicationHelper
  def js_to_add(type)
    r = Array.new

    if !Rails.env.development?
      r.push(asset_path("application.js"))

      if !@dev && !@dev_image && !@test
        r.push(asset_path("game.js"))
      end
    else
      r.push('/jquery/jquery-1.7.min.js?v=2')
      r.push('/jquery/jquery_ujs.js?v=2')
    end

    r.push('/bootstrap/js/bootstrap.min.js')

    if type == "game"
      r.push('http://js.pusher.com/1.12/pusher.min.js')

      if Rails.env.development?
        r.push('/assets/lib/jquery.dataTables.min.js?v=2')
        r.push('/assets/lib/customSelect.jquery.js')
        r.push('/assets/lib/labelover.js')
      end

      if Rails.env.development? && !@dev && !@dev_image
        r.push('/gameboard/game_page.js')
        r.push('/gameboard/communications.js?v=2')
        r.push('/gameboard/soundmanager.js?v=2')
        r.push('/gameboard/dicebox.js?v=2')
        r.push('/gameboard/land.js?v=2')
        r.push('/gameboard/map.js?v=2')
        r.push('/gameboard/mapcanvas.js?v=2')
        r.push('/gameboard/player.js?v=2')
        r.push('/gameboard/shared.js?v=2')
        r.push('/gameboard/warsocial.js?v=2')
      elsif @dev || @dev_image
        if @test
          r.push('/gameboard/game_page2.js')
        else
          r.push('/gameboard/game_page.js')
        end
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/communications.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/soundmanager.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/dicebox.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/land.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/map.js?v=4')
        if @dev
          r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/mapcanvas.js?v=4')
        else
          r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/mapcanvas_sprite.js?v=4')
        end
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/player.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/shared.js?v=4')
        r.push('http://www.bigroundeyes.ca/clients/Dustin/warsocial/warsocial/warsocial.js?v=4')
      elsif !(@dev || @dev_image) && @test
        r.push('/gameboard/game_page2.js')
        r.push('/gameboard/communications.js?v=2')
        r.push('/gameboard/soundmanager.js?v=2')
        r.push('/gameboard/dicebox.js?v=2')
        r.push('/gameboard/land.js?v=2')
        r.push('/gameboard/map.js?v=2')
        r.push('/gameboard/mapcanvas.js?v=2')
        r.push('/gameboard/player.js?v=2')
        r.push('/gameboard/shared.js?v=2')
        r.push('/gameboard/warsocial.js?v=2')
      end

      if Rails.env.development? || @dev || @dev_image
        r.push('/gameboard/turn_timer.js?v=2')
        if @test
          r.push('/gameboard/seats2.js?v=2')
        else
          r.push('/gameboard/seats.js?v=2')
        end
        r.push('/gameboard/lobby.js?v=2')
        r.push('/gameboard/chatbox.js?v=2')
        r.push('/gameboard/gamelog.js?v=2')
        r.push('/gameboard/create_game.js?v=2')
      end
    end

    return r
  end
end
