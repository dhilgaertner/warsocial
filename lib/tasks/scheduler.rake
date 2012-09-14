desc "This task is called by the Heroku scheduler add-on"
task :update_mailing_list => :environment do
  puts "Updating mailing list..."
  #NewsFeed.update
  puts "done."
end

task :send_month_end_in_1_week => :environment do
  #User.send_reminders
end