class AdminMailer < ActionMailer::Base
  default :from => "WarSocial Admin <admin_mailer@warsocial.com>"

  def chat_log_email(cls)
    @cls = cls

    mail(:to => "dustin@warsocial.com", :subject => "WarSocial Chat Log Report")
  end
end
