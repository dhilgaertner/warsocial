class ApplicationController < ActionController::Base

  def forem_user
    current_user
  end

  def delayed_job_admin_authentication
    redirect_to :root unless current_user && current_user.admin?
  end

  helper_method :forem_user

  protect_from_forgery
end
