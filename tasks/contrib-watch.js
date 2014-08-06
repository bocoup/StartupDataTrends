module.exports = function(grunt) {

  grunt.config.set('watch', {

    jshintrc: {
      files: ['**/.jshintrc'],
      tasks: ['jshint'],
    },

    build: {
      files: ['<%= jshint.build.src %>'],
      tasks: ['jshint:build'],
    },

    scripts: {
      files: ['<%= jshint.app.src %>'],
      tasks: ['jshint:app', 'uglify', 'concat'],
    },

    tests: {
      files: ['test/unit/**/*'],
      tasks: ['jshint:test-unit'],
    },

    page: {
      files: 'app/pages/*.html',
      tasks: ['copy:index'],
    },

    templates: {
      files: 'app/templates/*.html',
      tasks: ['jst']
    },

    assets: {
      files: 'assets/**/*',
      tasks: ['copy:prod', 'uglify', 'concat'],
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');

};