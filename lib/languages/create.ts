import langs = require('./core');

export function Create(lang, config, result) {
    var strategy: Language;
    switch (lang) {
        case new langs.TypeScript()._:
            strategy = new TypeScript();
            break;
        case new langs.JavaScript()._:
            strategy = new JavaScript();
            break;
        case new langs.Php()._:
            strategy = new Php();
            break;
        case new langs.StyleSheets()._:
            strategy = new StyleSheet();
            break;
        case new langs.Html()._:
            strategy = new Html();
            break;
        default: 
            throw Error("Language not yet implemented");
    }

    strategy.Create(config.languages[lang], result);
}

interface Language {
    Create(config, result);
}

class Html implements Language {
    public Create(config, result) {
        if (config.compile._ === "none") return;
        var html = new langs.Html()._;
        var part;
        switch (config.compile._) {
            case "jade":
                part = {
                    task: "jade",
                    package: "grunt-contrib-jade",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + html + ".src %>",
                            src: "<%= config.sources." + html + ".fileset.src %>",
                            dest: "<%= config.directories.target %>"
                        }]
                    }
                };
                break;
            case "markdown":
                part = {
                    task: "markdown",
                    package: "grunt-markdown",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + html + ".src %>",
                            src: "<%= config.sources." + html + ".fileset.src %>",
                            dest: "<%= config.directories.target %>",
                            ext: '.html'
                        }]
                    }
                };
                break;
            case "handlebars":
                part = {
                    task: "handlebars",
                    package: "grunt-contrib-handlebars",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + html + ".src %>",
                            src: "<%= config.sources." + html + ".fileset.src %>",
                            dest: "<%= config.directories.target %>"
                        }]
                    }
                };
                break;
        }
        result["build"] = result["build"] || {};
        result.build[html] = {};
        result.build[html][config.compile._] = part;
    }
}

class StyleSheet implements Language {
    public Create(config, result) {
        if (config.compile._ === "none") return;
        var css = new langs.StyleSheets()._;
        var part;
        switch (config.compile._) {
            case "Sass":
                part = {
                    task: "sass",
                    package: "grunt-contrib-sass",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + css + ".src %>",
                            src: "<%= config.sources." + css + ".fileset.src %>",
                            dest: "<%= config.directories.target %>",
                            ext: ".css"
                        }]
                    }
                };
                break;
            case "LESS":
                part = {
                    task: "less",
                    package: "grunt-contrib-less",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + css + ".src %>",
                            src: "<%= config.sources." + css + ".fileset.src %>",
                            dest: "<%= config.directories.target %>",
                            ext: ".css"
                        }]
                    }
                };
                break;
            case "Stylus":
                part = {
                    task: "stylus",
                    package: "grunt-contrib-stylus",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + css + ".src %>",
                            src: "<%= config.sources." + css + ".fileset.src %>",
                            dest: "<%= config.directories.target %>",
                            ext: ".css"
                        }]
                    }
                };
                break;
            case "SCSS":
                part = {
                    task: "sass",
                    package: "grunt-contrib-sass",
                    dist: {
                        files: [{
                            expand: true,
                            cwd: "<%= config.directories." + css + ".src %>",
                            src: "<%= config.sources." + css + ".fileset.src %>",
                            dest: "<%= config.directories.target %>",
                            ext: ".css"
                        }]
                    }
                };
                break;
                break;
        }
        result["build"] = result["build"] || {};
        result.build[css] = {};
        result.build[css][config.compile._] = part;
    }
}

class Php implements Language {
    public Create(config, result) {
        if (config.validate._) {
            result["validate"] = result["validate"] || {};
            result.validate["javascript"] = {
                "task": "phplint",
                "package": "grunt-phplint",
                "files": ["<%= config.sources.PHP.files %>"],
                "options": {
                    limit:10
                }
            };
        }

        result["test"] = result["test"] || {};
        result.test["php"] = {};
        if (config.unit._ != "-") {
            result.test.php["unit"] = {
                "unittests": {
                    "php-success": {
                        "task": "phpunit",
                        "package": "grunt-phpunit",
                        "classes": {
                            "dir": "<%= config.directories.PHP.unit %>/"
                        },
                        "options": {
                            "colors": true
                        }
                    }
                }
            };
        }
    }
}

class JavaScript implements Language {
    public Create(config, result) {
        if (config.validate._) {
            result["validate"] = result["validate"] || {};
            result.validate["javascript"] = {
                "task": "jshint",
                "package": "grunt-contrib-jshint",
                "files": ["<%= config.sources.JavaScript.files %>"],
                "options": {}
            };
        }

        result["test"] = result["test"] || {};
        result.test["javascript"] = {};
        if (config.unit._ != "-") {
            result.test.javascript["unit"] = {
                "task": "mochaTest",
                "package": "grunt-mocha-test",
                "dependencies": ["chai", "sinon"],
                "test": {
                    "src": ["<%= config.sources.JavaScript.unit %>"]
                }
            };
        }

        if (config.acceptance._ != "-") {
            result.test.javascript["acceptance"] = {
                "task": "cucumberjs",
                "package": "grunt-cucumber",
                "src": "<%= config.directories.JavaScript.acceptance %>",
                "dependencies": ["cucumber"],
                "options": {
                    "steps": "<%= config.directories.JavaScript.acceptance %>",
                    "modulePath": "<%= config.directories.root %>/node_modules/cucumber/lib/cucumber.js"
                }
            };
        }
    }
}

class TypeScript implements Language {
    public Create(config, result) {
        if (config.compile._) {
            result["compile"] = result["compile"] || {};
            result.compile["typescript"] = {
                "task": "ts",
                "package": "grunt-ts",
                "default": {
                    "options": {
                        "module": "commonjs",
                        "compile": true
                    },
                    "src": "<%= config.sources.TypeScript.files %>"
                }
            };
        }
        result["test"] = result["test"] || {};
        result.test["typescript"] = {};
        if (config.unit._ != "-") {
            result.test.typescript["unit"] = {
                "task": "mochaTest",
                "package": "grunt-mocha-test",
                "dependencies": ["chai", "sinon"],
                "test": {
                    "src": ["<%= config.sources.TypeScript.tests.unit %>"]
                }
            };
        }

        if (config.acceptance._ != "-") {
            result.test.typescript["acceptance"] = {
                "task": "cucumberjs",
                "package": "grunt-cucumber",
                "src": "<%= config.directories.TypeScript.acceptance %>",
                "dependencies": ["cucumber"],
                "options": {
                    "steps": "<%= config.directories.TypeScript.acceptance %>",
                    "modulePath": "<%= config.directories.root %>/node_modules/cucumber/lib/cucumber.js"
                }
            };
        }
    }
}