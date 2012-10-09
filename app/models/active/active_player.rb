class ActivePlayer

  attr_accessor :game_id, :user_id, :seat_number, :state, :username, :reserves, :current_points,
                :is_turn, :current_delta_points, :current_place, :missed_turns, :medals_json, :avatar_url

  def initialize(game_id, seat_number, state, user_id, username, current_points, avatar_url, medals_json="",
      is_turn=false, current_delta_points=0, current_place=0, reserves=0, missed_turns=0)
    self.game_id = game_id
    self.user_id = user_id.to_i
    self.seat_number = seat_number.to_i
    self.state = state
    self.username = username
    self.current_points = current_points.to_i
    self.is_turn = is_turn.to_s == "true"
    self.current_delta_points = current_delta_points.to_i
    self.current_place = current_place.to_i
    self.reserves = reserves == "" ? 0 : reserves.to_i
    self.missed_turns = missed_turns == "" ? 0 : missed_turns.to_i
    self.medals_json = medals_json == "" ? "[]" : medals_json
    self.avatar_url = avatar_url
  end

  def save
    REDIS.hset(self.id, "user_id", self.user_id)
    REDIS.hset(self.id, "seat_number", self.seat_number)
    REDIS.hset(self.id, "state", self.state)
    REDIS.hset(self.id, "username", self.username)
    REDIS.hset(self.id, "current_points", self.current_points)
    REDIS.hset(self.id, "is_turn", self.is_turn)
    REDIS.hset(self.id, "current_delta_points", self.current_delta_points)
    REDIS.hset(self.id, "current_place", self.current_place)
    REDIS.hset(self.id, "reserves", self.reserves)
    REDIS.hset(self.id, "missed_turns", self.missed_turns)
    REDIS.hset(self.id, "medals_json", self.medals_json)
    REDIS.hset(self.id, "avatar_url", self.avatar_url)
  end

  def delete
    REDIS.hdel(self.id, "user_id")
    REDIS.hdel(self.id, "seat_number")
    REDIS.hdel(self.id, "state")
    REDIS.hdel(self.id,"username")
    REDIS.hdel(self.id, "current_points")
    REDIS.hdel(self.id, "is_turn")
    REDIS.hdel(self.id, "current_delta_points")
    REDIS.hdel(self.id, "current_place")
    REDIS.hdel(self.id, "reserves")
    REDIS.hdel(self.id, "missed_turns")
    REDIS.hdel(self.id, "medals_json")
    REDIS.hdel(self.id, "avatar_url")
  end

  def as_json(options={})
    ls = self.lands.values
    dice_count = 0

    ls.each {|land| dice_count = dice_count + land.deployment }

    { :player_id => self.user_id,
      :seat_id => self.seat_number,
      :is_turn => self.is_turn,
      :name => self.username,
      :state => self.state,
      :current_points => self.current_points,
      :place => self.current_place,
      :land_count => self.lands.size,
      :dice_count => dice_count,
      :delta_points => self.current_delta_points == nil ? 0 : self.current_delta_points,
      :reserves => self.reserves,
      :medals_json => self.medals_json,
      :avatar_url => self.avatar_url
    }
  end

  # helper method to generate redis id
  def id
    "game:#{self.game_id}:player:#{self.user_id}"
  end

  def lands
    if @lands == nil
      @lands = Hash.new
    end
    @lands
  end

end