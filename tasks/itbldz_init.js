/*
 * grunt-itbldz-init
 * https://github.com/MatthiasKainer/grunt-itbldz-init
 *
 * Copyright (c) 2015 MatthiasKainer
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    
    var questions = require('../lib/question.js');
    var storage = require('../lib/fileCreation.js');
    
    grunt.registerTask('store-initialized-itbldz-config', 'called automatically', function () {
        var config = grunt.config("itbldz");
        if (config) {
            
            storage.Create.config(config);

            if (config._.some(function (x) { return x === "build" }))
                storage.Create.build(config);

            if (config._.some(function (x) { return x === "deploy" }))
                storage.Create.deploy(config);
            
        }

        grunt.log.ok("Setup complete. Run 'build-it' to start the build.");
        grunt.log.ok("You can always customize this setup by editing the *.json this assistant has created.");
    });

    grunt.registerTask('init-itbldz', 'Initalization script for itbldz', function () {
        
        var config = questions.setUp();
        grunt.verbose.writeln(config);
        grunt.initConfig({
            "prompt" : {
                "init" : {
                    "options" : {
                        "questions" : config
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-prompt');
        grunt.task.run([ "prompt", 'store-initialized-itbldz-config']);
    });
};
