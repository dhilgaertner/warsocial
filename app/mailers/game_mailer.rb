class GameMailer < ActionMailer::Base
  default :from => "WarSocial Notification <notification@warsocial.com>"

  def user_turn_started(user, game)
    @user = user
    @url  = "http://www.warsocial.com/game/#{game.name}"

    mail(:to => user.email, :subject => "Your turn has started on table #{game.name}")
  end
end
