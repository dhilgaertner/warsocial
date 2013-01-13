module MapsHelper

  def vote_active_class(votes, map_id, vote)
    return votes[vote].include?(map_id.to_s) ? "active" : ""
  end

end
