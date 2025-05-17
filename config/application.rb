require_relative "boot"

# Only require the Rails components that you need
require "rails"

# Core Rails components
require "action_controller/railtie"
require "action_view/railtie"

# Optional components - uncomment if needed
# require "active_model/railtie"
# require "active_job/railtie"
# require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module GithubPrWatcher
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # API-only mode
    config.api_only = true

    # Autoload paths
    config.autoload_lib(ignore: %w[assets tasks])

    # Application configuration
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
