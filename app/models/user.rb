class User < ActiveRecord::Base
  has_many :players
  has_many :games, :through => :players
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :omniauthable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :username, :forem_admin
  
  validates_presence_of :email
  validates_uniqueness_of :email
  validates_presence_of :username
  validates_uniqueness_of :username
  
  def admin?
    Pusher["game1"].trigger(GameMsgType::INFO, self.forem_admin)
    
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
end
