/*
 * grunt-itbldz-init
 * https://github.com/MatthiasKainer/grunt-itbldz-init
 *
 * Copyright (c) 2015 MatthiasKainer
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    
    // Project configuration.
    grunt.initConfig({
        // Configuration to be run (and then tested).
        "init-itbldz": {
        }
    });
    
    grunt.loadTasks('tasks');
    grunt.registerTask('default', ['init-itbldz']);

};
