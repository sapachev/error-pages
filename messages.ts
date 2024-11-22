export enum MessagesEnum {
  // Errors
  NO_CONFIG_PROPERTY = "Please set the '{{ prop }}' property in your configuration: {{ &path }}",
  NO_FILE = "There is no file to read: {{ &path }}",
  NO_DEFAULT_VARS = "Not enough data to initialize default template variables",
  NO_DIRECTORY = "There is no directory to read: {{ &path }}",
  NO_PATH = "There is no path in registry with the '{{ key }}' key",
  NO_SOURCE_DATA = "There is no source data to compile",
  NO_TEMPLATE_CONTENT = "There is no template content to render",
  OVERALL = "An error occurred during compilation. Please check the 'README.md' file for more details on how to call this process.\n\nDetails:\n{{ &stack }}",

  // Info
  COMPILE_PAGES = "Compile pages from the source data:",
  COMPILE_CONFIGS = "Compile web servers configuration snippets from the source data:",
  COPYING_ASSETS = "Copying assets to '{{ &dest }}' directory",
  DONE = "The Building process was completed {{ duration }}s",
  FLUSH_DESTINATION = "Flush build directory '{{ &path }}'",
  START = "Start the Building process",
  TAILWIND_CMD = "Run '{{ &cmd }}' command",
  TAILWIND_DONE = "Tailwind CSS styles were successfully built",
  TAILWIND_START = "Build the Tailwind CSS styles",

  // Skip
  SKIP_CP = "Copy {{ &src }} to {{ &dest }}",
  SKIP_MKDIR = "Create directory {{ &path }}",
  SKIP_RM = "Delete {{ &path }}",
  SKIP_WRITE = "write to {{ &path }}",

  // Warnings
  ENV_LOCALE = "The configuration locale value was overridden by the environment value '{{ locale }}'",
  NO_ASSETS_TO_COPY = "There are no assets in current theme directory",
  TAILWIND_DISABLED = "The Tailwind CSS was disabled in the config",
}
