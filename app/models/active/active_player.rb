class ActivePlayer

  attr_accessor :game_id, :user_id, :seat_number, :state, :username, :current_points, :is_turn, :current_delta_points, :current_place

  def initialize(game_id, seat_number, state, user_id, username, current_points, is_turn=false)
    self.game_id = game_id
    self.user_id = user_id.to_i
    self.seat_number = seat_number.to_i
    self.state = state
    self.username = username
    self.current_points = current_points.to_i
    self.is_turn = is_turn.to_s == "true"
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
      :delta_points => self.current_delta_points == null ? 0 : self.current_delta_points }
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