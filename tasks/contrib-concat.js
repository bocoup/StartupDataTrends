module.exports = function(grunt) {

  grunt.config.set("concat", {
    js: {
      options: {
        separator: ";"
      },
      src : [
        "prod/alt.deps.min.js",
        "assets/js/jquery-ui-1.8.16.custom.min.js",
        "assets/js/jquery-sparklines.js",
        "assets/js/jquery.colorbox-min.js",
        "prod/alt.src.min.js"
      ],

      dest: "prod/alt.min.js"
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");

};