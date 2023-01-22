## Custom HTTP Error Pages

Lightweight tool to create own static HTTP Error Pages in minimalistic responsive and accessible design features and customization support including localization.

# Features

* Static pages with simple design
* Lightweight and fast running
* Extensibility
* Customization
* Localization (i18n)
* Accessibility (a11y)
* Built-in web-server config generator (Nginx)


# How to use

Requirements: installed Node.js 11+

1. Checkout this repository to your local machine
2. Run `npm i` command to install dependencies
3. Run `npm run build` command to compile error pages and config
4. Copy static html-files from `dist` directory to your server
5. Copy and apply config snippet from `dist` to your web-server configuration


# How to improve default pages

* *Extensibility* A new pages can be added by adding new json-files in `scr/<locale>` directory. The page name must follow to format `<HTTP-code>.json` (`<HTTP-code>` is Number, related to specific HTTP status code). You can put any additional data to json-files, that you want to display on a page. In case of common variables, you can use `common.json` file to define them.
* *Customization* By editing default theme you can add anything you want. In case if you want to have own page desing, you can create a new theme and apply it by editing `config.json` file. All assets (images, fonts, etc) must be placed to `assets` directory. By default [mustache.js](https://www.npmjs.com/package/mustache) is used as a template engine and [Tailwind](https://tailwindcss.com/) as a CSS framework. Entry point of Tailwind styles must be located in `themes/<name>/assets/css/main.tcss` file. Custom Tailwind theme settings can be added to `theme.tailwind.config.js` file located in a root of theme directory. Also Tailwind can be disabled by editing `tailwind` option in `config.js`.
* *Localization* If you need to change default text messages, then you can simply edit existing files in`src/<locale>` directory according to your needs. If you want to create your own localization, just simply add new locale directory and create set of source files. After new locale adding, change `locale` property in `config.json` file, located in a root.


# Contributing

You are very welcome to contribute into this project with improvements, localizations, bug fixes and so on.