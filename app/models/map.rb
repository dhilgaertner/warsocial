class Map < ActiveRecord::Base
  has_many :games
  belongs_to :user

  attr_accessible :name, :json, :preview_url, :is_public, :is_admin_only, :desc

  def as_json(options={})
    { :name => self.name,
      :preview_url => self.preview_url,
      :author => self.user != nil ? self.user.username : nil,
      :desc => self.desc }
  end

  def self.vote(user, map_id, vote)
    add_vote = vote == 0 ? 0 : 1
    rem_vote = vote == 0 ? 1 : 0

    REDIS.multi do
      REDIS.sadd("user:#{user.id}:map_vote:#{add_vote}", map_id)
      REDIS.srem("user:#{user.id}:map_vote:#{rem_vote}", map_id)
      REDIS.sadd("map:#{map_id}:user_vote:#{add_vote}", user.id)
      REDIS.srem("map:#{map_id}:user_vote:#{rem_vote}", user.id)
    end
  end

  def self.validate_new_map(name, map_code)
    if (/^[0-9a-zA-Z ]+$/.match(name) == nil)
      return {
          :response => false,
          :message => "The name can only contain alpha numeric characters and spaces."
      }
    end

    map_code_array = map_code.split(",")

    if (map_code_array.size != 875)
      return {
          :response => false,
          :message => "The map code was invalid."
      }
    end

    if (map_code_array.uniq.size >= 7)
      return {
          :response => false,
          :message => "The map must contain a minimum of 7 lands."
      }
    end

    return {
        :response => true,
        :message => "Map passed validation."
    }
  end

  def self.get_votes(user)
    response = REDIS.multi do
      REDIS.smembers("user:#{user.id}:map_vote:0")
      REDIS.smembers("user:#{user.id}:map_vote:1")
    end

    return response
  end

  def self.get_vote_counts(map_id)
    votes = REDIS.multi do
      REDIS.scard("map:#{map_id}:user_vote:0")
      REDIS.scard("map:#{map_id}:user_vote:1")
    end

    return votes
  end

  def self.get_all_vote_counts
    keys = REDIS.keys("map:*:user_vote:*")
    map_ids = keys.collect { |k| k.split(":")[1] }

    votes = REDIS.multi do
      map_ids.each do |map_id|
        REDIS.scard("map:#{map_id}:user_vote:0")
        REDIS.scard("map:#{map_id}:user_vote:1")
      end
    end

    response = Hash.new

    map_ids.each_with_index do |map_id, index|
      map_vote_index = index * 2
      response[map_id] = [votes[map_vote_index], votes[map_vote_index + 1]]
    end

    return response
  end

  def self.add_favorite(user, map_id)
    REDIS.multi do
      REDIS.sadd("user:#{user.id}:map_favorites", map_id)
      REDIS.sadd("map:#{map_id}:user_favorites", user.id)
    end
  end

  def self.remove_favorite(user, map_id)
    REDIS.multi do
      REDIS.srem("user:#{user.id}:map_favorites", map_id)
      REDIS.srem("map:#{map_id}:user_favorites", user.id)
    end
  end

  def self.get_favorites(user)
    response = REDIS.smembers("user:#{user.id}:map_favorites")

    return response
  end

  def self.get_favorite_counts(map_id)
    favorites = REDIS.multi do
      REDIS.scard("map:#{map_id}:user_favorites")
    end

    return favorites
  end

  def self.get_all_favorite_counts
    keys = REDIS.keys("map:*:user_favorites")
    map_ids = keys.collect { |k| k.split(":")[1] }

    favorites = REDIS.multi do
      map_ids.each do |map_id|
        REDIS.scard("map:#{map_id}:user_favorites")
      end
    end

    response = Hash.new

    map_ids.each_with_index do |map_id, index|
      response[map_id] = favorites[index]
    end

    return response
  end
end