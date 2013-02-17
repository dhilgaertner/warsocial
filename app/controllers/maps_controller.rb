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

    map_id = params[:id]
    @map = Map.find(map_id)

    render :action => "map_creator", :layout => "application2"
  end

  def create
    if current_user != nil
      name = params[:name]
      map_code = params[:map_code]
      preview_url = params[:preview_url]
      desc = params[:desc]
      map_code_string = "... #{map_code.split(",")} ..."

      resp = Map.validate_new_map(name, map_code)

      if resp[:response]
        Map.create(:name => name,
                   :json => map_code_string,
                   :preview_url => preview_url,
                   :is_public => true,
                   :is_admin_only => false,
                   :desc => desc)

        render :text=>"Success", :status=>200
        return
      else
        render :text=>resp[:message], :status=>400
      end
    else
      render :text=>"You must be logged in.", :status=>400
    end
  end

  def update
    if current_user != nil
      map_id = params[:id]
      name = params[:name]
      map_code = params[:map_code]
      preview_url = params[:preview_url]
      desc = params[:desc]
      map_code_string = "... #{map_code.split(",")} ..."

      map = Map.find(map_id)
      resp = Map.validate_update_map(current_user, map, name, map_code)

      if resp[:response]
        map.json = map_code_string
        map.preview_url = preview_url
        map.desc = desc
        map.save

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
