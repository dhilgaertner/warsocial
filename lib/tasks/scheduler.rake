desc "This task saves time series data."
task :save_time_series_data => :environment do
  puts "Saving Time Series Data..."
  users = User.all
  User.transaction do
    users.each do |u|
      u.save_time_series_entries
    end
  end
  puts "done (stsd)..."
end