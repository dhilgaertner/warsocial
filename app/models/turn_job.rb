class TurnJob < Struct.new(:game_name)
  def perform
    require 'net/http'

    Delayed::Worker.logger.info self.game_name

    game = Game.get_game(self.game_name)

    base_url = Rails.env.production? ? "http://www.warsocial.com/" : "http://localhost:3000/"
    
    # url = URI.join(base_url,'home/force_end_turn')
    url = URI.join(base_url,'game/' + game.name + '/fet/whisper')
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) {|http|
      http.request(req)
    }
    
  end
end