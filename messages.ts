export enum MessagesEnum {
  // Errors
  NO_CONFIG_PROPERTY = "Please set '{{ Bright }}{{ prop }}{{ Reset }}' property in your configuration: {{ FgCyan }}{{ &path }}{{ Reset }}",
  NO_DIRECTORY = "No directory to read: {{ &path }}",
  NO_SOURCE_DATA = "No source data to compile",
  OVERALL = "An error occurred during compilation. Please, check 'README.md' to get more details about calling this process.\n\nError Message:\n{{ &message }}\n\nError stask:\n{{ &stack }}",

  // Info
  COMPILE_PAGES = "Compile pages from source data:",
  COMPILE_CONFIGS = "Compile web servers config snippets from source data:",
  COPYING_ASSETS = "Copying assets to build directory",
  DONE = "Building process was completed in {{ duration }}s",
  FLUSH_DESTINATION = "Flush build directory '{{ FgCyan }}{{ &path }}{{ Reset }}'",
  START = "Start building process",
  TAILWIND_CMD = "Run '{{ FgCyan }}{{ &cmd }}{{ Reset }}' command",
  TAILWIND_DONE = "Tailwind CSS styles were built",
  TAILWIND_START = "Build Tailwind CSS styles",

  // Skip
  SKIP_CP = "Copy {{ &src }} to {{ &dest }}",
  SKIP_MKDIR = "Create directory {{ &path }}",
  SKIP_RM = "Delete {{ &path }}",
  SKIP_WRITE = "write to {{ &path }}",

  // Warnings
  NO_ASSETS_TO_COPY = "No assets in current theme directory",
  TAILWIND_DISABLED = "Tailwind CSS was disabled in config",
}
