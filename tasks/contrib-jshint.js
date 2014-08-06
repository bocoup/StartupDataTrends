module.exports = function(grunt) {

  grunt.config.set('jshint', {
    build: {
      options: {
        jshintrc: '.jshintrc',
      },
      src: ['Gruntfile.js', 'build/**/*.js'],
    },

    app: {
      options: {
        jshintrc: 'app/.jshintrc',
      },
      src: ['app/**/*.js'],
    },

    'test-unit': {
      options: {
        jshintrc: 'test/unit/.jshintrc'
      },
      src: ['test/unit/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

};