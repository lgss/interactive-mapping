module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    "Backbone": true,
                    "_": true,
                    "OpenSpace": true,
                    "OpenLayers": true,
                    "app": true
                }
            },
            files: ['js/*.js', 'js/events/*.js', 'js/models/*.js', 'js/views/*.js', 'js/collections/*.js', 'js/routers/*.js']
        },
        uglify: {
            my_target: {
                options: {
                    sourceMap: 'path/to/source-map.js'
                },
                files: {
                    'js/build/app.min.js': [
                        'js/lib/OpenLayers.js',
                        'js/lib/vector3d.js',
                        'js/lib/geo.js',
                        'js/lib/latlon.js',
                        'js/lib/osgridref.js',
                        'js/lib/jquery-1.9.1.min.js',
                        'js/lib/underscore-min.js',
                        'js/lib/backbone-min.js',
                        'js/events/*.js',
                        'js/models/*.js',
                        'js/collections/*.js',
                        'js/views/*.js',
                        'js/routers/*.js',
                        'js/app.js',
                    ]
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'css/style.css': 'css/style.scss'
                }
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['jshint', 'uglify'],
                options: {
                    spawn: false,
                },
            },
            css: {
                files: ['css/*.scss', 'css/theme/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false,
                }
            }
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['jshint', 'uglify', 'sass', 'watch']);

};
