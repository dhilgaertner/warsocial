class AdminUser < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, 
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me

  def self.email_latest_chat_logs(amount=100)
    cls = REDIS.lrange("chat_logs", amount * -1, -1)

    AdminMailer.chat_log_email(cls).deliver
  end
end
