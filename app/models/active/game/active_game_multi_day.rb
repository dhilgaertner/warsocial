require 'active/game/active_game_base'

class ActiveGameMultiDay < ActiveGameBase

  def initialize(name, state, max_player_count, wager_level, map_name, map_json,
      connections=nil, turn_timer_id=nil, turn_count=0, seated_players_count=0)

    super(name, state, max_player_count, wager_level, map_name, map_json,
          connections, turn_timer_id, turn_count, seated_players_count, "multi_day")
  end

  def self.redis_prefix
    return "multiday"
  end

  def self.get_lobby_games
    ActiveGameMultiDay.get_lobby_games_with_key("multiday")
  end

  def turn_timer_run_at
    return 24.hours.from_now
  end

  def on_players_turn(player)
    user = User.find(player.user_id)

    GameMailer.user_turn_started(user, self).deliver
  end

end