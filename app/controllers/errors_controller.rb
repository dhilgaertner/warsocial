class ErrorsController < ApplicationController

  def not_found
    render :action => "not_found", :layout => "application2", :status => 404, :formats => [:html]
  end

  def server_error
    render :action => "server_error", :layout => "application2", :status => 500, :formats => [:html]
  end

end