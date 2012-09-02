class ActiveUser

  attr_accessor :user_id, :stats_toggle, :sounds_toggle, :layout_id

  def initialize(user_id, stats_toggle=true, sounds_toggle=true, layout_id=0)
    self.user_id = user_id.to_i
    self.stats_toggle = stats_toggle.to_s == "true"
    self.sounds_toggle = sounds_toggle.to_s == "true"
    self.layout_id = layout_id.to_i
  end

  def save
    REDIS.hset(self.id, "user_id", self.user_id)
    REDIS.hset(self.id, "stats_toggle", self.stats_toggle)
    REDIS.hset(self.id, "sounds_toggle", self.sounds_toggle)
    REDIS.hset(self.id, "layout_id", self.layout_id)
  end

  def delete
    REDIS.hdel(self.id, "user_id")
    REDIS.hdel(self.id, "stats_toggle")
    REDIS.hdel(self.id, "sounds_toggle")
    REDIS.hdel(self.id, "layout_id")
  end

  def as_json(options={})
    {
        :user_id => self.user_id,
        :stats_toggle => self.stats_toggle,
        :sounds_toggle => self.sounds_toggle
    }
  end

  # helper method to generate redis id
  def id
    "user:#{self.user_id}"
  end

  def self.get_active_user(user_id)

    user = ActiveUser.load_active_user(user_id)

    if user == nil

      user = ActiveUser.new(user_id)

      REDIS.multi do
        user.save
      end
    end

    return user
  end

  # Loads user from REDIS; return NIL if none found
  def self.load_active_user(user_id)
    user_data = REDIS.multi do
      REDIS.hgetall("user:#{user_id}")
    end

    if user_data[0].empty?
      return nil
    end

    uh = ActiveGameFactory.array_to_hash(user_data[0])
    user = ActiveUser.new(uh["user_id"],
                          uh["stats_toggle"],
                          uh["sounds_toggle"],
                          uh["layout_id"])

    return user
  end

end