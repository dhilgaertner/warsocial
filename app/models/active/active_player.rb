class ActivePlayer

  def initialize(game_id, seat_number, state, user_id, username, current_points, is_turn=false)
    @game_id = game_id
    @user_id = user_id.to_i
    @seat_number = seat_number.to_i
    @state = state
    @username = username
    @current_points = current_points.to_i
    @is_turn = is_turn.to_s == "true"
  end

  def save
    REDIS.multi do
      self.user_id = self.user_id.to_i
      self.seat_number = self.seat_number.to_i
      self.state = self.state
      self.username = self.username
      self.current_points = self.current_points.to_i
      self.is_turn = self.is_turn.to_s == "true"
    end
  end

  def delete
    REDIS.multi do
      REDIS.hdel(self.id, "user_id")
      REDIS.hdel(self.id, "seat_number")
      REDIS.hdel(self.id, "state")
      REDIS.hdel(self.id,"username")
      REDIS.hdel(self.id, "current_points")
      REDIS.hdel(self.id, "is_turn")
    end
  end

  def as_json(options={})
    #ls = self.lands
    #dice_count = 0

    #ls.each {|land| dice_count = dice_count + land.deployment.to_i }

    { :player_id => @user_id,
      :seat_id => self.seat_number,
      :is_turn => self.is_turn,
      :name => self.username,
      :state => self.state,
      :current_points => self.current_points,
      :place => self.current_place,
      :land_count => 0, #ls.size,
      :dice_count => 0, #dice_count,
      :delta_points => self.current_delta_points }
  end

  # helper method to generate redis id
  def id
    "game:#{self.game_id}:player:#{@user_id}"
  end

  def game_id
    @game_id
  end

  def user_id
    @user_id
  end

  def lands
    if @lands == nil
      @lands = Hash.new
    end
    @lands
  end

  def user_id=(user_id)
    @user_id = user_id
    REDIS.hset(self.id, "user_id", user_id)
  end

  def seat_number
    @seat_number
  end

  def seat_number=(seat_number)
    REDIS.hset(self.id, "seat_number", seat_number)
    @seat_number = seat_number
  end

  def state
    @state
  end

  def state=(state)
    REDIS.hset(self.id, "state", state)
    @state = state
  end

  def username
    @username
  end

  def username=(username)
    REDIS.hset(self.id, "username", username)
    @username = username
  end

  def current_points
    @current_points
  end

  def current_points=(current_points)
    REDIS.hset(self.id, "current_points", current_points)
    @current_points = current_points
  end

  def is_turn
    @is_turn
  end

  def is_turn=(is_turn)
    REDIS.hset(self.id, "is_turn", is_turn)
    @is_turn = is_turn
  end

  def current_delta_points
    @current_delta_points
  end

  def current_delta_points=(current_delta_points)
    REDIS.hset(self.id, "current_delta_points", current_delta_points)
    @current_delta_points = current_delta_points
  end

  def current_place
    @current_place
  end

  def current_place=(current_place)
    REDIS.hset(self.id, "current_place", current_place)
    @current_place = current_place
  end

end