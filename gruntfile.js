'use strict';

/**
* Module dependencies.
*/
var _ = require('lodash'),
defaultAssets = require('./config/assets/default'),
testAssets = require('./config/assets/test'),
testConfig = require('./config/env/test'),
fs = require('fs'),
path = require('path');

module.exports = function (grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: false
        }
      },
      serverJS: {
        files: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS),
        tasks: [],
        options: {
          livereload: false
        }
      },
      clientViews: {
        files: defaultAssets.client.views,
        options: {
          livereload: false
        }
      },
      clientJS: {
        files: defaultAssets.client.js,
        tasks: [],
        options: {
          livereload: false
        }
      },
      clientCSS: {
        files: defaultAssets.client.css,
        options: {
          livereload: false
        }
      },
      clientLESS: {
        files: defaultAssets.client.less,
        tasks: [ 'less' ],
        options: {
          livereload: false
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: [ '--debug' ],
          ext: 'js,html',
          watch: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
        }
      }
    },
    concurrent: {
      default: [ 'nodemon', 'watch' ],
      debug: [ 'nodemon', 'watch', 'node-inspector' ],
      options: {
        logConcurrentOutput: true
      }
    },
    jshint: {
      all: {
        src: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e),
        options: {
          jshintrc: true,
          node: true,
          mocha: true,
          jasmine: true
        }
      }
    },
    eslint: {
      options: {},
      target: _.union(defaultAssets.server.gruntConfig, defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e)
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: defaultAssets.client.css
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': defaultAssets.client.js
        }
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js',
          'public/dist/templates.min.js': 'public/dist/templates.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': 'modules/core/client/css/*.css'
        }
      }
    },
    less: {
      dist: {
        files: [ {
          expand: true,
          src: './modules/core/client/less/styles.less',
          ext: '.css',
          rename: function (base, src) {
            return src.replace('/less/', '/css/');
          }
        } ]
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },
    mochaTest: {
      src: testAssets.tests.server,
      options: {
        reporter: 'spec',
        timeout: 10000
      }
    },
    mocha_istanbul: {
      coverage: {
        src: testAssets.tests.server,
        options: {
          print: 'detail',
          coverage: true,
          require: 'test.js',
          coverageFolder: 'coverage/server',
          reportFormats: [ 'cobertura', 'lcovonly' ],
          check: {
            lines: 40,
            statements: 40
          }
        }
      }
    },
    karma: {
      unit: {
        configFile: '_karma.conf.js'
      }
    },
    protractor: {
      options: {
        configFile: 'protractor.conf.js',
        noColor: false,
        webdriverManagerUpdate: true
      },
      e2e: {
        options: {
          args: {} // Target-specific arguments
        }
      }
    },
    clean: {
      build: '.build/',
      dist: 'public/dist/',
      karma: '_karma.conf.js'
    },
    copy: {
      localConfig: {
        src: 'config/env/local.example.js',
        dest: 'config/env/local.js',
        filter: function () {
          return !fs.existsSync('config/env/local.js');
        }
      },
      build: {
        files: [
          { expand: true, cwd: 'config/assets', src: ['*'], dest: '.build/config' },
          { expand: true, cwd: 'public/dist', src: ['*'], dest: '.build/dist' }
        ]
      },
      karma: {
        files: [
          { src: 'karma.conf.js', dest: '_karma.conf.js' }
        ]
      }
    },
    concat: {
      options: {
        separator: ';\n',
        stripBanners: true
      },
      app: {
        src: [ defaultAssets.client.js ],
        dest: 'public/dist/application.js'
      },
      lib: {
        src: [ minifiedOrDefaultFiles(defaultAssets.client.lib.js) ],
        dest: 'public/dist/lib.js'
      },
      styles: {
        src: [ minifiedOrDefaultFiles(defaultAssets.client.lib.css) ],
        dest: 'public/dist/lib.min.css'
      }
    },
    wiredep: {
      task: {
        src: [
          'app/views/**/*.html',   // .html support...
          'app/views/**/*.jade'   // .jade support...
        ],
        options: {
          // See wiredep's configuration documentation for the options
          // you may pass:

          // https://github.com/taptapship/wiredep#configuration
        }
      }
    },
    ngtemplates: {
      options: {
        htmlmin: {
          collapseWhitespace: true,
          removeComments: true
        },
        url: function(url) {
          return url.replace('public/', '');
        },
        prefix: '/'
      },
      'mean': {
        src: ['public/modules/**/**.html', 'modules/*/client/**/**.html'],
        dest: 'public/dist/templates.js'
      }
    },
    filerev: {
      options: {
        algorithm: 'md5',
        length: 6
      },
      production: {
        files: [
          { src: ['public/dist/*.{css,js}'] }
        ]
      }
    },
    filerev_replace: {
      options: {
        assets_root: '.build/config/'
      },
      build: {
        src: '.build/**/*.*'
      },
      karma: {
        src: '_karma.conf.js'
      }
    },
    standard: {
      app: {
        src: [
          '{config,modules,public/modules}/**/*.js'
        ]
      }
    }
  });

  grunt.event.on('coverage', function (lcovFileContents, done) {
    // Set coverage config so karma-coverage knows to run coverage
    testConfig.coverage = true;
    require('coveralls').handleInput(lcovFileContents, function (err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-protractor-coverage');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-standard');

  // Make sure upload directory exists
  grunt.task.registerTask('mkdir:upload', 'Task that makes sure upload directory exists.', function () {
    // Get the callback
    var done = this.async();

    grunt.file.mkdir(path.normalize(__dirname + '/modules/users/client/img/profile/uploads'));

    done();
  });

  grunt.task.registerTask('server', 'Starting the server', function () {
    // Get the callback
    var done = this.async();

    var path = require('path');
    var app = require(path.resolve('./config/lib/app'));
    var server = app.start(function () {
      done();
    });
  });
  
  grunt.task.registerTask('serve', ['server']);

  // Lint CSS and JavaScript files.
  grunt.registerTask('lint', [ 'standard' ]);

  grunt.registerTask('wiredep', function () {
    var wiredep = require('wiredep')().js
    console.log(wiredep)
  })


  grunt.registerTask('default', [ 'env:dev', 'mkdir:upload', 'copy:localConfig', 'concurrent:default', 'watch' ]);
  // Run the project in production mode

  // Lint project files and minify them into two production files.
  grunt.registerTask('_build', ['env:dev', 'lint', 'less', 'ngtemplates', 'concat', 'uglify', 'cssmin', 'copy:build', 'filerev', 'filerev_replace']);
  grunt.registerTask('build', [ 'clean', '_build', 'clean:karma' ]);
  grunt.registerTask('prod', [ 'build', 'env:prod', 'mkdir:upload', 'copy:localConfig', 'concurrent:default' ]);
  grunt.registerTask('test', [ 'build', 'copy:karma', 'filerev_replace:karma', 'env:test', 'mkdir:upload', 'karma', 'clean:karma' ]);
  // grunt.registerTask('test', [ ]); // disabled
};

function minifiedOrDefaultFiles(files) {
  var minFilePatterns = ['$1.min.$2', '$1-min.$2'];

  var result = files.map(function(filePath) {
    var fileName = _.last(filePath.split('/'));
    var fileExt = (fileName.match(/\.(.+)$/) || [])[1];
    var dirPath = filePath.replace(fileName, '');

    for (var i in minFilePatterns) {
      var minFileName = fileName.replace(new RegExp('^(.+)\.(' + fileExt + ')$', 'i'), minFilePatterns[i]);
      if (fs.existsSync(dirPath + minFileName)) {
        return dirPath + minFileName;
      }
    }

    return filePath;
  });

  return result;
}
