module.exports = function(grunt) {


  grunt.config.set('connect', {
    options: {
      port: 8082,
      hostname: '*',
    },
    server: {
      options: {
        base: ['prod', '.'],
        keepalive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');

};