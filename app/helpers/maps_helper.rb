module MapsHelper

  def vote_active_class(votes, map_id, vote)
    return votes[vote].include?(map_id.to_s) ? "active" : ""
  end

  def map_vote_class(votes, map_id)
    if votes[0].include?(map_id.to_s)
      return "thumb-down"
    elsif votes[1].include?(map_id.to_s)
      return "thumb-up"
    else
      return ""
    end
  end

end
