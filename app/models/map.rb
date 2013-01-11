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
end