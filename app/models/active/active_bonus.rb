
class ActiveBonus

  def self.incr_by_till_max_then_cool_down(incr_by, bonus_name, bonus_id, bonus_max, bonus_delay)

    bonus_key = "bonus:#{bonus_name}:id:#{bonus_id}"
    bonus_value = REDIS.get(bonus_key).to_i

    if (bonus_value == nil || bonus_value >= 0)
      bonus_value = REDIS.incrby(bonus_key, incr_by)

      if (bonus_value >= bonus_max)
        REDIS.set(bonus_key, -999)
        REDIS.expire(bonus_key, bonus_delay)

        return ActiveBonusResponse.new(bonus_name, bonus_id, true, {
            :bonus_delay => bonus_delay
        })
      end
    else
      return ActiveBonusResponse.new(bonus_name, bonus_id, false, {
          :bonus_delay => bonus_delay
      })
    end
    return ActiveBonusResponse.new(bonus_name, bonus_id, false, {
        :bonus_value => bonus_value,
        :bonus_max => bonus_max
    })
  end

end

class ActiveBonusResponse

  attr_accessor :bonus_name, :bonus_id, :bonus_success, :bonus_message, :bonus_data

  def initialize(name, id, success, data=nil, message=nil)
    self.bonus_name = name
    self.bonus_id = id
    self.bonus_success = success
    self.bonus_message = message
    self.bonus_data = data
  end

end