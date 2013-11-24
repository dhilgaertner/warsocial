class Users::RegistrationsController < Devise::RegistrationsController
  protected
  def after_sign_up_path_for(resource)
    #sign_up_confirmed_url
    after_sign_in_path_for(resource)
    '/?signup=true'
  end

  def after_inactive_sign_up_path_for(resource)
    '/?signup=true'
  end
end
