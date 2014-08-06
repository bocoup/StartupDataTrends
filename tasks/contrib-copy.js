module.exports = function(grunt) {

  grunt.config.set('copy', {
    prod: {
      expand: true,
      cwd: 'assets/',
      src: '**/*',
      dest: 'prod/',
    },

    index: {
      expand: true,
      cwd: 'app/pages/',
      src: 'index.html',
      dest: 'prod/'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

};