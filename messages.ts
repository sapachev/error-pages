export enum MessagesEnum {
  // Errors
  NO_CONFIG_PROPERTY = "Please set '{{ prop }}' property in your configuration: {{ &path }}",
  NO_FILE = "No file to read: {{ &path }}",
  NO_DEFAULT_VARS = "Not enough data to init default template variables",
  NO_DIRECTORY = "No directory to read: {{ &path }}",
  NO_PATH = "No path in registry with '{{ key }}' key",
  NO_SOURCE_DATA = "No source data to compile",
  NO_TEMPLATE_CONTENT = "No template content to render",
  OVERALL = "An error occurred during compilation. Please, check 'README.md' to get more details about calling this process.\n\nDetails:\n{{ &stack }}",

  // Info
  COMPILE_PAGES = "Compile pages from source data:",
  COMPILE_CONFIGS = "Compile web servers config snippets from source data:",
  COPYING_ASSETS = "Copying assets to '{{ &dest }}' directory",
  DONE = "Building process was completed in {{ duration }}s",
  FLUSH_DESTINATION = "Flush build directory '{{ &path }}'",
  START = "Start building process",
  TAILWIND_CMD = "Run '{{ &cmd }}' command",
  TAILWIND_DONE = "Tailwind CSS styles were successfully built",
  TAILWIND_START = "Build Tailwind CSS styles",

  // Skip
  SKIP_CP = "Copy {{ &src }} to {{ &dest }}",
  SKIP_MKDIR = "Create directory {{ &path }}",
  SKIP_RM = "Delete {{ &path }}",
  SKIP_WRITE = "write to {{ &path }}",

  // Warnings
  ENV_LOCALE = "Config locale value was overrided with environment value '{{ locale }}'",
  NO_ASSETS_TO_COPY = "No assets in current theme directory",
  TAILWIND_DISABLED = "Tailwind CSS was disabled in config",
}
