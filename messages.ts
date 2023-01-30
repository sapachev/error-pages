export enum MessagesEnum {
  // Errors
  NO_CONFIG_PROPERTY = "Please set '{{ prop }}' property in your configuration: {{ &path }}",
  NO_DIRECTORY = "No directory to read: {{ &path }}",
  NO_SOURCE_DATA = "No source data to compile",

  // Info
  COMPILE_PAGES = "Compile pages from source data:",
  COMPILE_CONFIGS = "Compile web servers config snippets from source data:",
  COPYING_ASSETS = "Copying assets to build directory",
  // TODO: check next text
  DONE = "Building process was completed in {{ duration }}s",
  FLUSH_DESTINATION = "Flush build directory '{{ &path }}'",
  START = "Start building process",

  // Warnings
  NO_ASSETS_TO_COPY = "No assets in current theme directory",
}
