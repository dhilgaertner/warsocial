class MapsController < ApplicationController

  def index
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    if current_user != nil
      @my_votes = Map.get_votes(current_user)
    end

    @map_counts = ArchivedGame.map_usage_counts

    render :action => "index", :layout => "application2"
  end

  def detail
    @js_page_type = "maps"

    map_id = params[:map_id]

    @map = Map.find(map_id.to_i)

    render :action => "detail", :layout => "application2"
  end

  def vote
    if current_user != nil
      map_id = params[:map_id].to_i
      vote = params[:vote].to_i

      if map_id != 0
        Map.vote(current_user, map_id, vote)

        render :text=>"Success", :status=>200
        return;
      end
    end
    render :text=>"Failure", :status=>400
  end

end
