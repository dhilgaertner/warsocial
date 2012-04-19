# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "forem-theme-twist/version"

Gem::Specification.new do |s|
  s.name        = "forem-theme-twist"
  s.version     = Forem::Theme::Twist::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Ryan Bigg"]
  s.email       = ["radarlistener@gmail.com"]
  s.homepage    = ""
  s.summary     = %q{Theme based off Twist for forem.}
  s.description = %q{Theme based off Twist for forem.}

  s.rubyforge_project = "forem-theme-twist"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
