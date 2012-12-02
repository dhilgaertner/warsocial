desc "User Time-Series Recording"
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

desc "Active Users Recording"
task :save_active_users_data => :environment do
  puts "Saving Monthly Active Users..."
  User.save_active_users(30.days.ago, TimeSeriesType::MONTHLY_ACTIVE_USERS)
  puts "done (smau)..."

  puts "Saving Weekly Active Users..."
  User.save_active_users(1.week.ago, TimeSeriesType::WEEKLY_ACTIVE_USERS)
  puts "done (swau)..."
end

desc "Email Latest Chat Logs"
task :email_latest_chat_logs => :environment do
  puts "Emailing latest chat logs..."
  AdminUser.email_latest_chat_logs(1000)
  puts "done (elcl)..."
end

