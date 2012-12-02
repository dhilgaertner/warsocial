class UserSettingsController < ApplicationController

  def toggle_stats
    if (current_user != nil)
      is_on = params[:on].to_s == "true"
      user = ActiveUser.get_active_user(current_user.id)
      user.stats_toggle = is_on
      user.save

      render :text=>"saved", :status=>200
    else
      render :text=>"unauthorized", :status=>403
    end
  end

  def toggle_sounds
    if (current_user != nil)
      is_on = params[:on].to_s == "true"
      user = ActiveUser.get_active_user(current_user.id)
      user.sounds_toggle = is_on
      user.save

      render :text=>"saved", :status=>200
    else
      render :text=>"unauthorized", :status=>403
    end
  end

end
