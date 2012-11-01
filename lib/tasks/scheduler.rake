desc "This task is called by the Heroku scheduler add-on"
task :update_mailing_list => :environment do
  puts "Updating mailing list..."
  #NewsFeed.update
  puts "done."
end

desc "This task saves time series data."
task :save_time_series_data => :environment do
  puts "Saving Time Series Data..."
  users = User.all
  User.transaction do
    users.each do |u|

    end
  end
  puts "done (stsd)..."
end