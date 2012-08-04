require 'active/game/active_game_base'

class ActiveGameNormal < ActiveGameBase
  def initialize(name, state, max_player_count, wager_level, map_name, map_json,
      connections=nil, turn_timer_id=nil, turn_count=0, seated_players_count=0)

    super(name, state, max_player_count, wager_level, map_name, map_json,
          connections,turn_timer_id, turn_count, seated_players_count, "normal")

  end

  def redis_prefix
    return "normal"
  end

  def self.get_lobby_games
    ActiveGameNormal.get_lobby_games_with_key("normal")
  end

  def turn_timer_run_at
    return 20.seconds.from_now
  end

end