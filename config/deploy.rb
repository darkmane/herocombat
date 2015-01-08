require 'rubygems'
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)
require 'bundler/setup' if File.exists?(ENV['BUNDLE_GEMFILE'])

set :stages, %w(production uat)
set :default_stage, "production"
require 'capistrano/ext/multistage'  # this must appear after you set up the stages

set :application, "herocombat"
set :repository,  "https://github.com/darkmane/herocombat.git"
set :scm, :git
set :user, "deploy"
set :use_sudo, false
ssh_options[:forward_agent] = true

set :deploy_via, :remote_cache
set :deploy_to, "/var/www/#{application}"
set :deploy_env, "production"
set :keep_releases, 10

set :node_pid, "#{deploy_to}/shared/pids/node.pid"

set :branch, ENV["branch"] if ENV["branch"]
set :branch, ENV["BRANCH"] if ENV["BRANCH"]

desc "check current deployed revision"
task :check_revision, :except => { :admin => true, :no_release => true } do
  run "cat #{current_path}/REVISION"
end

namespace :deploy do
  namespace :rollback do
    desc "we overwrote cleanup because it was screwing up unicorn which couldn't find its files during restart"
    task :cleanup do
      puts Color.red("Please note.  The rollbacked version of the code (#{current_release}) is still on the server.  You should move it out of the way once unicorn has restarted with the rolled back code.")
    end
  end

  task :start do
    run "cd #{deploy_to}/current && npm install"
    run "ln -s #{deploy_to}/logs #{deploy_to}/current/logs"
    run "nodejs #{deploy_to}/current/web.js >#{deploy_to}/log.txt 2>&1 &"
    run "ps aux | grep web.js | grep -v grep | awk '{ print $2 }' > #{node_pid}"
  end

  task :stop, :on_error => :continue do
    run "kill $(cat #{node_pid})"
  end

  task :restart do
    deploy.stop
    deploy.start
  end
end

def with_user(new_user, &block)
  old_user = user
  set :user, new_user
  close_sessions
  yield
  set :user, old_user
  close_sessions
end

def close_sessions
  sessions.values.each { |session| session.close }
  sessions.clear
end
