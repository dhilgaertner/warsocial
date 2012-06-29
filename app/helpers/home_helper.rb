module HomeHelper

  def setting_checked(active_user, setting_name, default_response)
    if (active_user == nil)
      return default_response ? 'checked="checked"' : ''
    else
      return active_user.send(setting_name) ? 'checked="checked"' : ''
    end
  end
end
