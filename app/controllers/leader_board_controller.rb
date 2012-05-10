class LeaderBoardController < ApplicationController
  def index
    @player_list = User.find()
  end

  def all_time
    @player_list = User.find()
  end
end
