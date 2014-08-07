
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('credentials.json')
  });

  // Load Grunt plugins.
  grunt.loadTasks('tasks');

  grunt.registerTask('build',
    'Builds prod version',
    ['jshint', 'clean:prod', 'jst', 'copy', 'uglify', 'concat', 'clean:postbuild']);

  grunt.registerTask('dev',
    'Compile and start a dev webserver.',
    ['build', 'watch']);

  grunt.registerTask('default', ['dev']);

};