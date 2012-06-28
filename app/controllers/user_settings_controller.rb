class UserSettingsController < ApplicationController

  def toggle_stats
    is_on = params[:on].to_s == "true"
    user = ActiveUser.get_active_user(current_user.id)
    user.stats_toggle = is_on
    user.save

    render :text=>"saved", :status=>200
  end

  def toggle_sounds
    is_on = params[:on].to_s == "true"
    user = ActiveUser.get_active_user(current_user.id)
    user.sounds_toggle = is_on
    user.save

    render :text=>"saved", :status=>200
  end

  def toggle_layout
    layout_id = params[:layout_id].to_i
    user = ActiveUser.get_active_user(current_user.id)
    user.layout_id = layout_id
    user.save

    render :text=>"saved", :status=>200
  end

end
