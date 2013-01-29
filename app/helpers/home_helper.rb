module HomeHelper

  def setting_active(active_user, setting_name, expected_value)
    if (active_user == nil)
      return ''
    else
      return active_user.send(setting_name) == expected_value ? 'active' : ''
    end
  end

  def setting_checked(active_user, setting_name, default_response)
    if (active_user == nil)
      return default_response ? 'checked="checked"' : ''
    else
      return active_user.send(setting_name) ? 'checked="checked"' : ''
    end
  end

  def vote_percentage(vote)
    v1 = vote
    v2 = vote == 0 ? 1 : 0

    if (@map_votes[v1] == 0)
      return 0
    else
      perc = (@map_votes[v1].to_f / (@map_votes[v1].to_f + @map_votes[v2].to_f)) * 100.0

      return perc.to_i
    end
  end
end
