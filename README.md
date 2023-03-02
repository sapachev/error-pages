[![Quality Check](https://github.com/sapachev/error-pages/actions/workflows/ci.yml/badge.svg)](https://github.com/sapachev/error-pages/actions/workflows/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/sapachev/error-pages/badge.svg?branch=main)](https://coveralls.io/github/sapachev/error-pages?branch=main)

# The Error Pages

Lightweight tool to create static custom HTTP Error Pages in minimalistic adaptive and accessible design with customization and localization support.

![Screenshot](https://sapachev.github.io/error-pages/assets/screenshot.png?3)

## Features

* Static pages with simple and responsive design
* Lightweight and fast running
* Extensibility
* Customization
* Localization (i18n)
* Accessibility (a11y)
* Built-in web server config generator (Nginx)


## Demo

* [400 Bad Request](https://sapachev.com/error-pages/bad-request)
* [401 Unauthorized](https://sapachev.com/error-pages/unauthorized)
* [403 Forbidden](https://sapachev.com/error-pages/forbidden)
* [404 Not Found](https://sapachev.com/error-pages/not-found)
* [410 Gone](https://sapachev.com/error-pages/gone)
* [500 Internal Server Error](https://sapachev.com/error-pages/internal-server-error)
* [502 Bad Gateway](https://sapachev.com/error-pages/bad-gateway)
* [503 Service Unavailable](https://sapachev.com/error-pages/service-unavailable)
* [504 Gateway Timeout](https://sapachev.com/error-pages/gateway-timeout)


## Primitive Usage

If you want to get already precompiled packages, please download latest version from [official website](https://sapachev.github.io/error-pages/#precompiled-packages).

The installation steps are following:
1. Download [package](https://sapachev.github.io/error-pages/#precompiled-packages) and extract files from it
2. Copy static html files from `dist` directory to your server
3. Copy and apply config snippet from `dist` to your web server configuration.


## Basic Usage

Requirements: installed Node.js 11+

1. Checkout this repository to your local machine
2. Run `npm install --production` command to install dependencies
3. Run `npm run build` command to compile error pages and web server configs
4. Copy static html files from `dist` directory to your server
5. Copy and apply config snippet from `dist` to your web server configuration.

```
$ git clone git@github.com:sapachev/error-pages.git
…
$ npm install --production
…
$ npm run build
…
INFO: Start building process
INFO: Flush build directory ‘/home/error-pages/dist’
INFO: Compile pages from source data:
• /home/error-pages/dist/400.html
• /home/error-pages/dist/401.html
• /home/error-pages/dist/403.html
• /home/error-pages/dist/404.html
• /home/error-pages/dist/410.html
• /home/error-pages/dist/500.html
• /home/error-pages/dist/502.html
• /home/error-pages/dist/503.html
• /home/error-pages/dist/504.html
INFO: Compile web servers config snippets from source data:
• /home/error-pages/dist/nginx-error-pages.conf
INFO: Build Tailwind CSS styles
INFO: Run ‘INPUT="/home/error-pages/themes/minimalistic/@assets/css/main.twnd.css" OUTPUT="/home/error-pages/dist/@assets/css/main.css" npm run build:tailwind’ command
INFO: Tailwind CSS styles were built
INFO: Copying assets to ‘/home/error-pages/dist/@assets’ directory
INFO: Building process was completed in 1.727s
```


## Advanced Usage

In addition to steps from Basic Usage, you can improve results by changing some parts of the default package: templates, styles, texts, web server snippets.

The main configuration is stored in the `config.json` file in a root directory and you can change this config file according to your needs:

```{
  "tailwind": true,
  "theme": "minimalistic",
  "locale": "en"
}
```

### Templates

All templates are located in the `themes` directory. You can change the existing `minimalistic` theme or add a new one. There are no special requirements to page templates: every template is a usual HTML document with injected variables for the text messages from locale files. The [mustache.js](https://www.npmjs.com/package/mustache) library was used to handle variables injection and compile templates. So if you want to have something specific around templates, you can refer to this library documentation to get more information about templating.

After adding your own template, just specify it in the config file to compile a new page with this template.


### Styles

Templates styling is based on the [Tailwind CSS](https://tailwindcss.com/) framework. With this framework you can quickly create page styles without writing separate CSS code. The entry point of Tailwind styles must be located in the `themes/<name>/@assets/css/main.twnd.css` file. From this point will be created the `main.css` file with compiled and minified styles. In addition, you can tune the Tailwind by creating a custom `theme.tailwind.config.js` file located in the root of your theme directory and adding to it any Tailwind options, which you want. Full list of Tailwind options you can find in Tailwind [documentation](https://tailwindcss.com/docs/configuration).

However, if you don’t want to use Tailwind and prefer to use already existing CSS styles, you can disable Tailwind in the main configuration (`config.json` file). In this case, the Tailwind Build step will be just skipped without any side effects on results.


### Text Messages and Localization

All text messages are stored in JSON files, splitted by languages, which are placed in the `src` directory. Each page will be created from its locale file `<HTTP code>.json` (`<HTTP code>` is a number, related to specific HTTP status code). So if you want to create a page for the non-existing status code, then just create a JSON file with this status description.

Every locale file can be extended with any number of variables that you want to display on a page. To define common variables, you can use the `common.json` file — variables from this file will be applied to every page.

To localize your pages, just create a new directory in the `src` with any pages you want to generate. You are able to choose any set of HTTP status codes (for example, only for the 4xx errors), just follow the naming convention and don’t forget to extract common messages to the `common.json` file of your locale.


### Server Configurations

During the build process, the Tool will automatically create a config snippet for your server. This snippet will contain information about handled errors and locations to reach the pages that represent them. At the moment, the only Nginx server supported.

You just need to copy all files from the `dist` directory to your server and apply automatically created config snippet to existing server configuration. According to the snippet template, all pages must be located in the `/usr/share/nginx/html/error-pages` directory. In case if you want to change something in a snippet, you can edit the template in the `snippets` directory. Same as for the page templates, these templates support the mustache.js engine, so you can use any render logic you want (lists, conditions, etc).

The config snippet itself I would recommend to place in the `/etc/nginx/snippets/` directory and use the following line to include it to your configuration: `include /etc/nginx/snippets/nginx-error-pages.conf;`.

Here is an example of web server configuration with included the error pages snippet:

```
server {
  server_name example.com;
  access_log /var/log/nginx/example.access.log;
  include /etc/nginx/snippets/nginx-error-pages.conf;

  location / {
    root /data/www;
  }
}
```


## Contributing

This project is open to contributions and if you have any ideas and wish to realize them, then add Pull Request to discuss your idea solution. I will provide you with full support during this process. Don’t hesitate to ask me about code and solutions of your ideas.
