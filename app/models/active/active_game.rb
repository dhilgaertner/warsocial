class ActiveGame

  def initialize(name, state, max_player_count, wager_level, map_name, map_json)
    REDIS.multi do
      @name = name

      self.state = state
      self.max_player_count = max_player_count
      self.wager_level = wager_level
      self.map_name = map_name
      self.map_json = map_json
    end
  end

  # helper method to generate redis id
  def id
    "game:#{self.name}"
  end

  def name
    @name
  end

  def state
    @state
  end

  def state=(state)
    REDIS.hset(self.id, "state", state)
    @state = state
  end

  def turn_timer_id
    @turn_timer_id
  end

  def turn_timer_id=(turn_timer_id)
    REDIS.hset(self.id, "turn_timer_id", turn_timer_id)
    @turn_timer_id = turn_timer_id
  end

  def max_player_count
    @max_player_count
  end

  def max_player_count=(max_player_count)
    REDIS.hset(self.id, "max_player_count", max_player_count)
    @max_player_count = max_player_count
  end

  def wager_level
    @wager_level
  end

  def wager_level=(wager_level)
    REDIS.hset(self.id, "wager_level", wager_level)
    @wager_level = wager_level
  end

  def map_name
    @map_name
  end

  def map_name=(map_name)
    REDIS.hset(self.id, "map_name", map_name)
    @map_name = map_name
  end

  def map_json
    @map_json
  end

  def map_json=(map_json)
    REDIS.hset(self.id, "map_json", map_json)
    @map_json = map_json
  end

  def as_json(options={})
    { :name => self.name,
      :state => self.state,
      :players => [], # self.players.as_json,
      :max_players => self.max_player_count,
      :map => self.map_name
    }
  end

  # Find running game by name or create a new one
  def self.get_active_game(name)

    game = ActiveGame.load_active_game(name)

    if game == nil
      settings = GameRule.where("game_name = ?", name).first

      map_name = (settings == nil) ? "default" : settings.map_name
      num_players = (settings == nil) ? 2 : settings.player_count
      wager = (settings == nil) ? 0 : settings.wager_level

      map = Map.where("name = ?", map_name).first

      game = ActiveGame.new(:name => name,
                            :map_name => map.name,
                            :map_json => map.json,
                            :state => Game::WAITING_STATE,
                            :max_player_count => num_players,
                            :wager_level => wager)
    end

    return game
  end

  # Loads game from REDIS; return NIL if none found
  def self.load_active_game(name)
    # TODO: LOAD ACTIVEGAME BY NAME FROM REDIS; NIL IF NONE

  end

  private
  def broadcast(room, type, message)
    Pusher["presence-" + room].trigger(type, message)
  end

  # Get random roll results
  private
  def roll(num_dice)
    num_dice.to_i.times.map{ rand_with_range(1..6) }
  end

  private
  def rand_with_range(values = nil)
    if values.respond_to? :sort_by
      result = values.sort_by { rand }.first
    else
      rand(values)
    end
  end
end