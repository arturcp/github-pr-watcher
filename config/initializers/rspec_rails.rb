# Disable previews in test environment
if Rails.env.test?
  # Rails.application.config.action_controller.show_previews = false

  # Disable view rendering in tests
  config = Rails.application.config
  config.action_controller.cache_store = :null_store
  config.action_controller.perform_caching = false
  config.cache_store = :null_store

  # Disable asset compilation in tests
  config.assets.compile = false
  config.assets.debug = false

  # Disable view rendering in specs
  config.view_component.render_monkey_patch_enabled = false if defined?(ViewComponent)
end
