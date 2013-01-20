class Map < ActiveRecord::Base
  has_many :games
  
  attr_accessible :name, :json, :preview_url, :is_public, :is_admin_only

  def as_json(options={})
    { :name => self.name,
      :preview_url => self.preview_url }
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

  def self.get_votes(user)
    response = REDIS.multi do
      REDIS.smembers("user:#{user.id}:map_vote:0")
      REDIS.smembers("user:#{user.id}:map_vote:1")
    end

    return response
  end

  def self.get_vote_counts
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

  def self.get_favorite_counts
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