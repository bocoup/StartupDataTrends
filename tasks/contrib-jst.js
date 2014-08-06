module.exports = function(grunt) {

  grunt.config.set('jst', {
    compile : {
      options : {
        namespace: 'ALT.app.templates',
        processName: function(filepath) {
          var l = filepath.length;
          return filepath.slice("app/templates/".length, l - 5);

        }
      },

      files : {
        'prod/templates.js' : ['app/templates/*.html']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jst');

};