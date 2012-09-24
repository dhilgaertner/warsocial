require 'active/game/active_game_base'

class ActiveGameMultiDay < ActiveGameBase

  def initialize(name, state, max_player_count, wager_level, map_name, map_json,
      connections=nil, turn_timer_id=nil, turn_count=0, seated_players_count=0)

    super(name, state, max_player_count, wager_level, map_name, map_json,
          connections, turn_timer_id, turn_count, seated_players_count, "multi_day")
  end

  def redis_prefix
    return "multiday"
  end

  # WARNING: MAKE SURE YOU WANT TO RUN THIS!
  # I USE IT TO RESET THE MULTIDAY GAME WAGERS
  # AT THE END OF THE SEASON
  def self.reset_games_to_zero_wager
    games = ActiveGameMultiDay.get_lobby_games(nil)

    games.each do |g|
      game = ActiveGameFactory.get_active_game(g[:name]);
      if (game.wager_level > 0)
        game.wager_level = 0
        game.save
      end
    end
  end

  def self.get_lobby_games(user)
    games = ActiveGameMultiDay.get_lobby_games_with_key("multiday", user)

    return games
  end

  def turn_timer_run_at
    return 24.hours.from_now
  end

  def on_players_turn(player)
    user = User.find(player.user_id)

    GameMailer.user_turn_started(user, self).deliver
  end

end