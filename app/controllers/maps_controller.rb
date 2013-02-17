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

  def new
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    render :action => "map_creator", :layout => "application2"
  end

  def edit
    @js_page_type = "maps"

    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    render :action => "map_creator", :layout => "application2"
  end

  def show
    @js_page_type = "maps"

    map_id = params[:id]

    @map = Map.find(map_id.to_i)

    render :action => "detail", :layout => "application2"
  end

  def create
    if current_user != nil
      name = params[:name]
      map_code = params[:map_code]
      resp = Map.validate_new_map(name, map_code)

      if resp[:response]
        #create the map

        render :text=>"Success", :status=>200
        return
      else
        render :text=>resp[:message], :status=>400
      end
    else
      render :text=>"You must be logged in.", :status=>400
    end
  end

  def vote
    if current_user != nil
      map_id = params[:id].to_i
      vote = params[:vote].to_i

      if map_id != 0
        Map.vote(current_user, map_id, vote)

        render :text=>"Success", :status=>200
        return
      end
    end
    render :text=>"Failure", :status=>400
  end

  def favorite
    if current_user != nil
      map_id = params[:id].to_i
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
