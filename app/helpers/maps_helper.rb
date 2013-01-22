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

  def map_favorite_class(library, map_id)
    if library.include?(map_id.to_s)
      return "del-favorite"
    else
      return "add-favorite"
    end
  end

  def map_tooltip_favorite(num_favorites)
    return "Favorite / Un-favorite this map. <br> #{num_favorites == nil ? "0" : num_favorites} user(s) have favorited this map."
  end

  def map_tooltip_like(num_like)
    return "Vote FOR this map. <br> #{num_like == nil ? "0" : num_like} user(s) have voted FOR this map."
  end

  def map_tooltip_unlike(num_unlike)
    return "Vote AGAINST this map. <br> #{num_unlike == nil ? "0" : num_unlike} user(s) have voted AGAINST this map."
  end

  def map_vote_count(map_votes, map, vote)
    if map_votes.kind_of? Hash
      if map_votes[map.id.to_s] != nil
        if map_votes[map.id.to_s].size > vote
          return map_votes[map.id.to_s][vote]
        end
      end
    end

    return 0
  end

  def map_fav_count(map_favs, map)
    if map_favs.kind_of? Hash
      if map_favs[map.id.to_s] != nil
        return map_favs[map.id.to_s]
      end
    end

    return 0
  end
end
