class User < ActiveRecord::Base
  has_many :players
  has_many :games, :through => :players
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :omniauthable,
         :recoverable, :rememberable, :trackable, :validatable#, :confirmable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username, :forem_admin,
                  :current_points, :total_points
  
  validates_presence_of :email
  validates_uniqueness_of :email
  validates_presence_of :username
  validates_uniqueness_of :username
  validates_format_of :username, :with => /\A[a-zA-Z]+([a-zA-Z]|\d)*\Z/, :message => 'cannot contain special characters.'

  def admin?
    self.forem_admin
  end

  def self.find_for_oauth(access_token, signed_in_resource=nil)
    logger.info access_token
    
    data = access_token.info
    puts access_token.inspect
    if user = User.find_by_email(data.email)
      user
    else # Create a user with a stub password. 
      User.create!(:email => data.email, :username => data.name, :password => Devise.friendly_token[0,20]) 
    end
  end
  
  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["info"]
        user.email = data["email"]
        user.username = data["name"]
      end
    end
  end

  # Defining the keys
  private
  def self.current_key
    key(Time.now.strftime("%M"))
  end

  private
  def self.keys_in_last_n_minutes(n)
    now = Time.now
    times = (0..n).collect {|num| now - num.minutes }
    times.collect{ |t| key(t.strftime("%M")) }
  end

  private
  def self.key(minute)
    "online_users_minute_#{minute}"
  end

  private
  def self.user_key(id, key)
    "user:#{id.to_s}:#{key.to_s}"
  end

# Tracking an Active User
  def self.track_user_id(data)
    key = current_key

    REDIS.sadd(key, data[:user_id])
    REDIS.expire(key, 60 * 20)

    loc_key = user_key(data[:user_id], "last_loc")
    REDIS.set(loc_key, data[:game])
    REDIS.expire(loc_key, 60 * 20)
  end

# Who's online
  def self.online_user_ids
    REDIS.sunion(*keys_in_last_n_minutes(10))
  end

  # Who's online
  def self.online_users
    ids = self.online_user_ids

    if (!ids.empty?)
      users = [*User.find(*ids)]

      loc_keys = ids.collect {|id| user_key(id, "last_loc") }
      locs = REDIS.mget(*loc_keys)

      result = Array.new
      users.each_with_index do |u, index|
        result << { :user_id => u.id,
                    :username => u.username,
                    :current_points => u.current_points,
                    :location => locs[index]
                  }
      end

      return result
    else
      return []
    end
  end

  private
  def self.online_friend_ids(interested_user_id)
    REDIS.multi do
      REDIS.sunionstore("online_users", *keys_in_last_n_minutes(10))
      REDIS.sinter("online_users", "user:#{interested_user_id}:friend_ids")
    end
  end
end
