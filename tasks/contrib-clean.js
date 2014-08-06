module.exports = function(grunt) {

  grunt.config.set('clean', {
    prod: {
      src: ['prod']
    },
    postbuild: {
      src: ['prod/alt.deps.min.js', 'prod/alt.src.min.js', 'prod/js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');

};