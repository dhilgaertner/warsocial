class MapsController < ApplicationController
  before_filter :authenticate_user!, :except => [:index]

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
    @type = :new
    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)
    @map = Map.new

    render :action => "map_creator", :layout => "application2"
  end

  def edit
    @js_page_type = "maps"
    @type = :edit
    @maps = Map.where("is_public = ? AND is_admin_only = ?", true, false)

    map_id = params[:id]
    @map = Map.find(map_id)

    render :action => "map_creator", :layout => "application2"
  end

  def create
    map = Map.new(params[:map])

    map.is_public = true
    map.is_admin_only = false
    map.user = current_user

    resp = Map.validate_new_map(map)

    if resp[:response]
      map.save
    else
      render :text=>resp[:message], :status=>400
    end
  end

  def update
    map = Map.new(params[:map])

    resp = Map.validate_new_map(map)

    if resp[:response]
      m = Map.find(params[:map][:id])

      if (m.user == current_user)
        m.json = map.json
        m.preview = map.preview
        m.save

        render :text=>"Success", :status=>200
      else
        render :text=>"Permission Denied.", :status=>400
      end
    else
      render :text=>resp[:message], :status=>400
    end
  end

  def vote
    map_id = params[:id].to_i
    vote = params[:vote].to_i

    if map_id != 0
      Map.vote(current_user, map_id, vote)

      render :text=>"Success", :status=>200
      return
    end
  end

  def favorite
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

end
