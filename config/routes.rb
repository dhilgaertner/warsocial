Dice::Application.routes.draw do
  match "mark_it_up/preview" => "mark_it_up#preview"

  mount RailsAdmin::Engine => '/admin', :as => 'rails_admin'
  mount Forem::Engine, :at => "/forums"

  get "home/index"

  devise_scope :user do
    get '/users/auth/:provider' => 'users/omniauth_callbacks#passthru'
  end

  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }

  # The priority is based upon order of creation:
  # first created -> highest priority.
  match 'leaderboard' => 'leader_board#index'

  match 'fb' => 'home#facebook_index'
  match 'fb/game/:game_name/' => 'home#facebook_index'

  match 'game/:game_name/' => 'home#index'
  match 'game/:game_name/fet/:auth' => 'home#force_end_turn'
  match 'game/:game_name/attack' => 'home#attack'

  resources :home do
    collection do
      post :add_line, :as => :add_line
      post :create_game, :as => :create_game
      get :end_turn, :as => :end_turn
      get :kill_table, :as => :kill_table
      get :sit, :as => :sit
      get :stand, :as => :stand
      get :flag, :as => :flag
      get :get_lobby_games, :as => :get_lobby_games
  #    get :force_end_turn, :as => :force_end_turn
    end
  end

  resources :pusher do
    collection do
      post :auth, :as => :auth
      post :webhook, :as => :webhook
    end   
  end
    
  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'home#index'
  
  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
