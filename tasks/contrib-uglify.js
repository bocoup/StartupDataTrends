module.exports = function(grunt) {

  grunt.config.set('uglify', {
    options: {
      compress: false,
      beautify: true
    },

    deps: {
      files: {
        'prod/alt.deps.min.js': [
          "assets/js/libs/jquery.js",
          "assets/js/libs/underscore.js",
          "assets/js/libs/backbone.js"
        ]
      }
    },

    src: {
      files: {
        'prod/alt.src.min.js': [
          "prod/templates.js",
          "app/application.js",
          "app/modules/utils.js",
          "app/modules/search.js",
          "app/modules/startup.js",
          "app/modules/base.js"
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

};