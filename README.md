[![Quality Check](https://github.com/sapachev/error-pages/actions/workflows/ci.yml/badge.svg)](https://github.com/sapachev/error-pages/actions/workflows/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/sapachev/error-pages/badge.svg?branch=main)](https://coveralls.io/github/sapachev/error-pages?branch=main)

## Custom HTTP Error Pages

Lightweight tool to create static HTTP Error Pages in minimalistic adaptive and accessible design with customization and localization support.

# Features

* Static pages with simple and responsive design
* Lightweight and fast running
* Extensibility
* Customization
* Localization (i18n)
* Accessibility (a11y)
* Built-in web server config generator (Nginx)

![Screenshot](https://sapachev.github.io/error-pages/assets/screenshot.png?1)

# Demo

* [400 Bad Request](https://sapachev.com/error-pages/bad-request)
* [401 Unauthorized](https://sapachev.com/error-pages/unauthorized)
* [403 Forbidden](https://sapachev.com/error-pages/forbidden)
* [404 Not Found](https://sapachev.com/error-pages/not-found)
* [410 Gone](https://sapachev.com/error-pages/gone)
* [500 Internal Server Error](https://sapachev.com/error-pages/internal-server-error)
* [502 Bad Gateway](https://sapachev.com/error-pages/bad-gateway)
* [503 Service Unavailable](https://sapachev.com/error-pages/service-unavailable)
* [504 Gateway Timeout](https://sapachev.com/error-pages/gateway-timeout)


# Precompiled Packages

If you want to get already precompiled packages, then you can download latest versions from [official website]|(https://sapachev.github.io/error-pages/#precompiled-packages).


# How to use

Requirements: installed Node.js 11+

1. Checkout this repository to your local machine
2. Run `npm install --production` command to install dependencies
3. Run `npm run build` command to compile error pages and web server configs
4. Copy static html files from `dist` directory to your server
5. Copy and apply config snippet from `dist` to your web server configuration (see details below).

*Nginx*

Nginx config located in `/dist/<locale>/nginx-error-pages.conf` file and can be copied to `/etc/nginx/snippets/` directory. According to this config file, all html pages and their assets must be placed in the `/usr/share/nginx/html/error-pages` directory. After copying all files you have to update your server configuration with `include /etc/nginx/snippets/nginx-error-pages.conf;` line.


# How to improve default pages

* *Extensibility* New pages can be added by adding new json files in `scr/<locale>` directory. The page name must follow to format `<HTTP code>.json` (`<HTTP code>` is Number, related to specific HTTP status code). You can put any additional data to json files that you want to display on a page. In case of common variables, you can use the`common.json` file to define them.
* *Customization* By editing the default theme you can add anything you want. In case if you want to have your own page design, you can create a new theme and apply it by editing `config.json` file. All assets (images, fonts, etc) must be placed in the `@assets` directory (note: the `@assets` name is used to avoid a naming collision with default assets directory name in common cases). By default the [mustache.js](https://www.npmjs.com/package/mustache) is used as a template engine and [Tailwind](https://tailwindcss.com/) as a CSS framework. Entry point of Tailwind styles must be located in `themes/<name>/@assets/css/main.twnd.css` file. Custom Tailwind theme settings can be added to the `theme.tailwind.config.js` file located in the root of the theme directory. If you don't want to use Tailwind builder, then it can be disabled by editing the `tailwind` option in `config.js`.
* *Localization* If you need to change default text messages, then you can simply edit existing files in`src/<locale>` directory according to your needs. If you want to create your own localization, just simply add a new locale directory and create a set of source files. After new locale adding, change `locale` property in `config.json` file, located in a root.


# Contributing

You are very welcome to contribute to this project with improvements, localizations, bug fixes and so on.
