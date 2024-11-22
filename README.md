[![Quality Check](https://github.com/sapachev/error-pages/actions/workflows/ci.yml/badge.svg)](https://github.com/sapachev/error-pages/actions/workflows/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/sapachev/error-pages/badge.svg?branch=main)](https://coveralls.io/github/sapachev/error-pages?branch=main)

# The Error Pages

A lightweight tool for creating static custom HTTP error pages featuring a minimalistic, adaptive, and accessible design, along with support for customization and localization.

![Screenshot](https://sapachev.github.io/error-pages/assets/screenshot.png?4)

## Features

* Static pages featuring a simple and responsive design
* Lightweight and fast running
* Extensibility
* Customization
* Localization (i18n)
* Accessibility (a11y)
* Automated typography support
* Built-in web server configuration generator (Nginx)


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

If you would like to obtain precompiled packages, please download the latest version from the [official website](https://sapachev.github.io/error-pages/#precompiled-packages).

The installation steps are following:
1. Download the [package](https://sapachev.github.io/error-pages/#precompiled-packages) and extract the files
2. Copy static HTML files from the `dist` directory to your server
3. Copy and apply the configuration snippet from the `dist` to your web server configuration using the following line: `include /etc/nginx/snippets/nginx-error-pages.conf;`


## Basic Usage

Requirements: installed Node.js 11+

1. Checkout this repository to your local machine
2. Run `npm install --production` command to install dependencies
3. Run `npm run build` command to compile error pages and web server configuration snippets
4. Copy static HTML files from the `dist` directory to your server
5. Copy and apply the configuration snippet from the `dist` to your web server configuration using the following line: `include /etc/nginx/snippets/nginx-error-pages.conf;`

```
$ git clone git@github.com:sapachev/error-pages.git
…
$ npm install --production
…
$ npm run build
…
INFO: Start the Building process
INFO: Flush build directory ‘/home/error-pages/dist’
INFO: Compile pages from the source data:
• /home/error-pages/dist/400.html
• /home/error-pages/dist/401.html
• /home/error-pages/dist/403.html
• /home/error-pages/dist/404.html
• /home/error-pages/dist/410.html
• /home/error-pages/dist/500.html
• /home/error-pages/dist/502.html
• /home/error-pages/dist/503.html
• /home/error-pages/dist/504.html
INFO: Compile web servers configuration snippets from the source data:
• /home/error-pages/dist/nginx-error-pages.conf
INFO: Build the Tailwind CSS styles
INFO: Run ‘INPUT="/home/error-pages/themes/minimalistic/@assets/css/main.twnd.css" OUTPUT="/home/error-pages/dist/@assets/css/main.css" npm run build:tailwind’ command
INFO: Tailwind CSS styles were built
INFO: Copying assets to ‘/home/error-pages/dist/@assets’ directory
INFO: The Building process was completed in 1.727s
```


## Advanced Usage

In addition to the steps outlined in the Basic Usage section, you can enhance results by modifying certain components of the default package, such as templates, styles, text, and web server configuration snippets.

The main configuration is stored in the `config.json` file located in the root directory. You can modify this configuration file according to your needs:

```json
{
  "tailwind": true,
  "theme": "minimalistic",
  "locale": "en"
}
```

It is possible to run a hot-reload server to develop your own theme with custom markup, styles, and scripts. To start the development server, simply run the command `npm run dev`. This command will launch the server on 8080 port: ([http://localhost:8080](http://localhost:8080)). By default, this address will be opened with a first status code defined in the `src` directory, which corresponds to the configured `locale` value. You can choose any other code to continue developing a specific page. Don't be surprised by the injected code segments in a rendered page, as this is a feature of hot-reload mode. Any modifications to the main configuration will require a restart of the development server. During development, only the configured theme and locale directories are beign monitored.


### Templates

All templates are located in the `themes` directory. You can modify the existing `minimalistic` theme or add a new one. There are no special requirements for page templates; each template is a standard HTML document with injected variables for text messages from locale files. The [mustache.js](https://www.npmjs.com/package/mustache) library is used for injecting variables and compiling templates. If you require specific information about templates, please consult the library's documentation for more details on templating.

After adding your custom template, simply specify it in the configuration file to generate a new page using this template.


### Styles

The styling of the templates is based on the [Tailwind CSS](https://tailwindcss.com/) framework. Using this framework, you can easily create page styles without having to write additional CSS code. The entry point for Tailwind styles must be located in the `themes//@assets/css/main.twnd.css` file. From this point, the `main.css` file will be created with compiled and minified styles. In addition, you can customize Tailwind by creating a `theme.tailwind.config.js` file in the root of your theme directory. You can add any Tailwind options you desire to this file. A complete list of Tailwind options can be found in the Tailwind [documentation](https://tailwindcss.com/docs/configuration).

However, if you prefer not to use Tailwind and would rather utilize existing CSS styles, you can disable Tailwind in the main configuration (`config.json`). In this case, the Tailwind build step will be skipped without any side effects on the results.


### Text Messages and Localization

All text messages are stored in JSON files, organized by language, and are located in the `src` directory. Each page will be generated from its corresponding locale file `<HTTP code>.json` (where `<HTTP code>` represents a number associated with a specific HTTP status code). Therefore, if you wish to create a page for a non-existent status code, simply create a JSON file that includes the description for that status.

Every locale file can be extended with any number of variables that you wish to display on a page. To define common variables, you can utilize the `common.json` file. The variables from this file will be applied to every page.

To localize your pages, simply create a new directory in the `src` folder containing any pages you wish to generate. You can select any set of HTTP status codes (for example, only for the 4xx errors); just adhere to the naming convention and remember to extract common messages to the `common.json` file for your locale.

All texts are processed using the [Typograf](https://github.com/typograf/typograf) library by default. This process operates automatically, so there is no need to pre-modify texts in the source directory. If you are adding a new locale, please refer to the list of [supported locales](https://github.com/typograf/typograf/blob/dev/docs/LOCALES.en-US.md) and update the locale mappings in the `TYPOGRAF_LOCALES` constant.


### Server Configurations

During the build process, the tool will automatically generate a configuration snippet for your server. This snippet will include information about handled errors and the locations to access the pages that represent them. Currently, only the Nginx server is supported.

You simply need to copy all files from the `dist` directory to your server and apply the automatically created configuration snippet to the existing server configuration. According to the snippet template, all pages must be located in the `/usr/share/nginx/html/error-pages` directory. If you wish to modify any aspect of the snippet, you can edit the template in the `snippets` directory. Similar to the page templates, these templates support the Mustache.js engine, allowing you to utilize any rendering logic you desire (such as lists, conditions, loops, etc.).

The configuration snippet should be placed in the `/etc/nginx/snippets/` directory. To include it in your configuration, use the following line: `include /etc/nginx/snippets/nginx-error-pages.conf;`.

Here is an example of web server configuration that includes a snippet for error pages:

```nginx
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

This project welcomes contributions! If you have any ideas and would like to bring them to life, please submit a Pull Request to discuss your proposed solution. I will provide you with full support throughout this process. Don’t hesitate to reach out to me with any questions regarding the code or your ideas.
