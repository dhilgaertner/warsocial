class Users::RegistrationsController < Devise::RegistrationsController
  protected
  def after_sign_up_path_for(resource)
    sign_up_confirmed_url
  end

  def after_inactive_sign_up_path_for(resource)
    '/?signup=true'
  end
end
