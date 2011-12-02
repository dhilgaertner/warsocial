class TurnJob < Struct.new(:channel)
  def perform
    require 'net/http'
    
    # Delayed::Worker.logger.info "helllooooooisudifouifoduo"
    
    game = Game.get_game("home")
    cur_player = Player.where("game_id = ? AND is_turn = ?", game.id, true).first
    
    cur_seat_number = cur_player.seat_number
    next_seat_number = (cur_seat_number == game.players.size) ? 1 : cur_seat_number+1
    
    next_player = Player.where("game_id = ? AND seat_number = ?", game.id, next_seat_number).first
    
    cur_player.is_turn = false;
    next_player.is_turn = true;
    
    cur_player.save
    next_player.save
    
    base_url = Rails.env.production? ? "http://www.warsocial.com/" : "http://localhost:3000/"
    
    url = URI.join(base_url,'home/force_end_turn')
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) {|http|
      http.request(req)
    }
    
  end
end