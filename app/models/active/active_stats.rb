require 'archived/archived_game'
require 'archived/archived_player'

class ActiveStats

  def self.game_finished(game)
    ag = ArchivedGame.new(
      :name => game.name,
      :game_type => game.game_type,
      :wager => game.wager_level,
      :map_name => game.map_name,
      :map_json => game.map_json
    )

    ag.save!

    ArchivedGame.transaction do
      game.players.values.each do |p|
        ag.archived_players.create(
          :user_id => p.user_id,
          :seat_number => p.seat_number,
          :finishing_place => p.current_place,
          :delta_points => p.current_delta_points
        )
      end
    end
  end

end