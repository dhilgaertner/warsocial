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

  def self.get_lobby_games(user)
    ActiveGameNormal.get_lobby_games_with_key("normal", user)
  end

  def turn_timer_run_at
    return 20.seconds.from_now
  end

  def on_player_cash_out(player)
    track_player_cash_out(player)
  end

  private
  def track_player_cash_out(player)
    response = ActiveBonus.incr_by_till_max_then_cool_down(
        1,
        BonusType::GAME_LIVE,
        player.user_id,
        15,
        60 #(60 * 60 * 24) #24 hours
    )

    if (response.bonus_success)
      broadcast(self.name, GameMsgType::SERVER_MSG, "BONUS!!!")
    elsif (response.bonus_data[:bonus_value] != nil)
      val = response.bonus_data[:bonus_value]
      max = response.bonus_data[:bonus_max]

      broadcast(self.name, GameMsgType::SERVER_MSG, "no bonus... #{val}/#{max}")
    end
  end

end