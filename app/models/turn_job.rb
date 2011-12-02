class TurnJob < Struct.new(:channel)
  def perform
    require 'net/http'

    # Delayed::Worker.logger.info "helllooooooisudifouifoduo"
    @url = URI.parse('http://localhost:3000/home/force_end_turn')
    @req = Net::HTTP::Get.new(@url.path)
    @res = Net::HTTP.start(@url.host, @url.port) {|http|
      http.request(@req)
    }
    
  end
end