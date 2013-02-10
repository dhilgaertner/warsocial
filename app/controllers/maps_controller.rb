class MapsController < ApplicationController

  def index
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    @map_votes = Map.get_all_vote_counts
    @map_favorites = Map.get_all_favorite_counts

    if current_user != nil
      @my_votes = Map.get_votes(current_user)
      @my_library = Map.get_favorites(current_user)
    end

    @map_counts = ArchivedGame.map_usage_counts

    render :action => "index", :layout => "application2"
  end

  def creator
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    render :action => "map_creator", :layout => "application2"
  end

  def creator_edit
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    render :action => "map_creator", :layout => "application2"
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

  def favorite
    if current_user != nil
      map_id = params[:map_id].to_i
      favorite = params[:favorite].to_i

      if map_id != 0

        case favorite
          when 0 then
            Map.remove_favorite(current_user, map_id)
          when 1 then
            Map.add_favorite(current_user, map_id)
          else
            render :text=>"Failure", :status=>400
            return
        end

        render :text=>"Success", :status=>200
        return
      end
    end
    render :text=>"Failure", :status=>400
  end

end
