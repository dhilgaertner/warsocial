class GameState < Enumeration
  self.add_item(:WAITING, 'waiting for players')
  self.add_item(:STARTED, 'game started')
  self.add_item(:FINISHED, 'game finished')
end
