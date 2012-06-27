class UserSettingsController < ApplicationController

  def toggle_stats
    is_on = params[:on].to_s == "true"
    user = ActiveUser.get_active_user(current_user.id)
    user.stats_toggle = is_on
    user.save
  end

  def toggle_sounds
    is_on = params[:on].to_s == "true"
    user = ActiveUser.get_active_user(current_user.id)
    user.sounds_toggle = is_on
    user.save
  end

end
