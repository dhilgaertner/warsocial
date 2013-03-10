class ErrorsController < ApplicationController

  def not_found
    render :action => "not_found", :layout => "application", :status => 404, :formats => [:html]
  end

  def server_error
    render :action => "server_error", :layout => "application", :status => 500, :formats => [:html]
  end

end