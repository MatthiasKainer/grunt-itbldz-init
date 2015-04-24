import questions = require('./../question');
import languages = require('./../languages/core');
import path = require('path');

var join = (front, back) => {
    return (front, (back !== ".") ? back : "").replace(/[\\]/g, "/");
};

function getFolderFor(lang, what = "src") { return "<%= config.directories['" + lang + "']." + what + " %>/"; }

var fileset = (lang, ...files: string[]) => {
    return {
        expand: true,
        cwd: getFolderFor(lang),
        src: files,
        dest: "<%= config.directories.target %>"
    };
};

export function _for(lang, config, result) {

    if (lang === new languages.TypeScript()._) {
        result.sources[lang] = {
            files: [getFolderFor(lang) + "**/*.ts", "!" + getFolderFor(lang) + "node_modules/**/*"],
            tests: {
                unit : [getFolderFor(lang, "unit") + "**/*.js"]
            }
        };
        result.deployables.files.push(fileset(lang, "**/*.js", "**/*.json", "!node_modules/**/*", "readme.md"));
    }

    if (lang === new languages.JavaScript()._) {
        result.sources[lang] = {
            files: [getFolderFor(lang) + "**/*.js"]
        };
        result.deployables.files.push(fileset(lang, "**/*.js", "**/*.json", "!node_modules/**/*", "readme.md"));
    }

    if (lang === new languages.Php()._) {
        result.sources[lang] = {
            files: [getFolderFor(lang) + "**/*.php"]
        };
        result.deployables.files.push(fileset(lang, "**/*.php"));
        if (config.languages[lang].binary._ !== "-") {
            result.files = result.files || {};
            result.files[lang] = result.files[lang] || {};
            result.files[lang].binary = config.languages[lang].binary._;
        }
    }

    if (lang === new languages.Cs()._) {
        result.sources[lang] = {
            files: [getFolderFor(lang) + "**/*.cs"]
        };

        result.deployables.files.push(fileset(lang, "**/*.dll", "**/*.exe", "**/*.config"));
    }

    if (lang === new languages.Java()._) {
        result.sources[lang] = {
            files: [getFolderFor(lang) + "**/*.java"]
        };
        result.deployables.files.push(fileset(lang, "**/*.jar", "**/*.war"));
    }

    if (lang === new languages.Html()._) {
        if (config.languages[lang].compile._ == "none") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.html", getFolderFor(lang) + "**/*.htm"]
            };
            result.deployables.files.push(fileset(lang, "**/*.html", "**/*.htm"));
        }
        else if (config.languages[lang].compile._ == "markdown") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.md", getFolderFor(lang) + "**/*.markdown"]
            };
            result.deployables.files.push(fileset(lang, "**/*.md", "**/*.markdown"));
        }
        else if (config.languages[lang].compile._ == "jade") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.jade"]
            };
            result.deployables.files.push(fileset(lang, "**/*.jade"));
        }
        else if (config.languages[lang].compile._ == "handlebars") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.js"]
            };
            result.deployables.files.push(fileset(lang, "**/*.js"));
        }
    }

    if (lang === new languages.StyleSheets()._) {
        if (config.languages[lang].compile._ == "none") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.css"]
            };
        }
        else if (config.languages[lang].compile._ == "stylus") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.sty"]
            };
        }
        else if (config.languages[lang].compile._ == "LESS") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.less"]
            };
        }
        else if (config.languages[lang].compile._ == "Sass") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.sass"],
                fileset : fileset(lang, "**/*.sass")
            };
        }
        else if (config.languages[lang].compile._ == "SCSS") {
            result.sources[lang] = {
                files: [getFolderFor(lang) + "**/*.scss"]
            };
        }

        result.deployables.files.push(fileset(lang, "**/*.css"));
    }
}