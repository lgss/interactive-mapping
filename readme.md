# Interactive Mapping

This is an interative mapping application which enables you to publish overlay layers onto an Ordnance Survey base map.


## Dependencies

This application is designed to server the overlay layers using the free and open-source [Geoserver](http://geoserver.org), however, it wouldn't be too much effort to rework the application using any map server that has a WMS or WFS end point.


- [Geoserver](http://geoserver.org) - back end server and data provider, installed and configured seperately.
- [OpenSpace.js](http://www.ordnancesurvey.co.uk/business-and-government/products/os-openspace/index.html) - OS OpenSpace® application programming interface (API) allows OS maps to be embedded and displayed on your web page or online application. This also includes the [OpenLayers](http://openlayers.org) library.
- [Backbone.js](http://backbonejs.org) - helps keep things modular
- [Inuit.css](http://inuitcss.com/) - a powerful, scalable, Sass-based, BEM, OOCSS framework from [@csswizardry](https://twitter.com/csswizardry)
- [NPM](http://nodejs.org/) - NPM is included as part of Node.js
- [Grunt](http://gruntjs.com/) - a javascript task runner to handle dependencies, compilation and minification.


## Getting Started

### Install Geoserver

1. Install the latest stable version of [Geoserver](http://geoserver.org), the WAR file is easily deployed on Apache Tomcat
2. Run your Geoserver instance, if you're working locally to begin with, you'll probably find your Geoserver at [http://localhost:8080/geoserver](http://localhost:8080/geoserver)
3. [Install the CSS Module](http://docs.geoserver.org/latest/en/user/extensions/css/install.html) to make styling Vector Layers a bit easier
4. Setup a Workspace called 'Overlays'
5. Add a Data Store to the Workspace
6. Publish some Layers to your Data Store


### Register for OS OpenSpace®

1. Head over to the OS OpenSpace® website and [register for an API key](http://www.ordnancesurvey.co.uk/business-and-government/products/os-openspace/api/index.html)
2. Save the API key somewhere safe.


### Setting up the application

1. Copy this whole repository into your web directory, e.g var/www/html/interactive-mapping
2. From the command line, change the directory to your interactive mapping directory
3. Run 'npm install' to install grunt and its dependencies
4. Open the js/app.example.js file ready for editing
5. Completing the configuration in app.example.js
6. Rename app.example.js to app.js
7. Back in the command line, run 'grunt' to compile the JavaScript and SASS
8. Grunt will continue to watch for changes, as you save files it will recompile

### Deploying

1. For the front end application you'll need to deploy
	- index.html
	- css/style.css
	- img/*
	- js/build/app.min.js
	- theme/*
	- plus any other files you've added
2. Also note, your app.js file will need to be compiled with the correct urls for your live environment if they're different from your development environment.