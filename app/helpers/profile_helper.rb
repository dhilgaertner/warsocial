module ProfileHelper

  def find_me(game, user)
    me = game.archived_players.select {|p| p.user_id == user.id }
    return me.first
  end

  def game_row_class(game)
    me = find_me(game, current_user)
    if (me.delta_points > 0)
      return "background-color: #DFF0D8;"
    elsif (me.delta_points < 0)
      return "background-color: #F2DEDE;"
    else
      return "background-color: #FCF8E3;"
    end
  end
end
