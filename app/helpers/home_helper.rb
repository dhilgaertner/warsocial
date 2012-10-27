module HomeHelper

  def setting_active(active_user, setting_name, expected_value)
    if (active_user == nil)
      return ''
    else
      return active_user.send(setting_name) == expected_value ? 'active' : ''
    end
  end

  def setting_checked(active_user, setting_name, default_response)
    if (active_user == nil)
      return default_response ? 'checked="checked"' : ''
    else
      return active_user.send(setting_name) ? 'checked="checked"' : ''
    end
  end
end
