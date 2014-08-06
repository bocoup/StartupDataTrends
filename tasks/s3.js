module.exports = function(grunt) {

  grunt.config.set('s3', {

    options: {
      accessKeyId: "<%= aws.accessKeyId %>",
      secretAccessKey: "<%= aws.secretAccessKey %>",
      bucket: "startupdatatrends.com"
    },
    prod: {
      cwd: "prod/",
      src: "**"
    }

  });

  grunt.loadNpmTasks('grunt-aws');

};

