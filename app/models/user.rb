class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :omniauthable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username
  
  validates_presence_of :email
  validates_uniqueness_of :email
  validates_presence_of :username
  validates_uniqueness_of :username
  
  def self.find_for_oauth(access_token, signed_in_resource=nil)
    logger.info access_token
    
    data = access_token.extra.raw_info
    puts "hello"
    puts data.email
    puts data.username
    if user = User.find_by_email(data.email)
      user
    else # Create a user with a stub password. 
      User.create!(:email => data.email, :username => data.username, :password => Devise.friendly_token[0,20]) 
    end
  end
  
  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["user_hash"]
        puts "hello2"
        puts data
        puts data["username"]
        user.email = data["email"]
        user.username = data["username"]
      end
      logger.info session["devise.twitter_data"]
      if data = session["devise.twitter_data"] && session["devise.twitter_data"]["extra"]["user_hash"]
        user.email = data["email"]
      end
    end
  end
end
