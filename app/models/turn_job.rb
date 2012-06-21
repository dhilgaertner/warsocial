class TurnJob < Struct.new(:game_name, :turn_count)
  def perform
    require 'net/http'

    base_url = Rails.env.production? ? "http://www.warsocial.com/" : "http://localhost:3000/"
    
    # url = URI.join(base_url,'home/force_end_turn')
    url = URI.join(base_url,'game/' + self.game_name + '/fet/' + self.turn_count + '/whisper')
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) {|http|
      http.request(req)
    }
    
  end
end