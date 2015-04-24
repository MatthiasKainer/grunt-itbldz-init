import questions = require('./question');
import add = require('./files/add');
import fs = require('fs');
import languages = require('./languages/core');
import language = require('./languages/create');
import path = require('path');

var join = (front, back) => {
    return (front + (back !== ".") ? back : "").replace(/\\/g, "/");
};

var root = "<%= config.directories.root %>/";

export class Create {
    static save(file, result) {
        fs.writeFileSync(file, JSON.stringify(result, null, 4)); 
    }

    public static config(config) {
        var result: any = {
            directories: {
                target: root + config.target._
            },
            sources: {},
            deployables: {
                files : []
            }
        };

        var addFolderFor = (lang, what) => {
            if (!config.languages[lang][what]) return;
            result.directories[lang][what] = join(root, config.languages[lang][what]._);
        };

        var addFilesFor = (lang) => {
            add._for(lang, config, result);
        };

        if (config.languages) {
            config.languages._.forEach((lang) => {
                result.directories[lang] = {
                    "src": join(root, config.languages[lang].src._)
                };

                addFolderFor(lang, "unit");
                addFolderFor(lang, "acceptance");
                addFolderFor(lang, "unit");

                addFilesFor(lang);
            });
        }

        Create.save('config.json', result);
    }

    public static build(config) {
        var result = {
            "prepare": {
                "clean": {
                    "task": "clean",
                    "package": "grunt-contrib-clean",
                    "options": { "force": true },
                    "target": ["<%= config.directories.target %>"]
                }
            }
        };

        if (config.languages) {
            config.languages._.forEach((lang) => {
                language.Create(lang, config, result);
            });
        }

        result["create-deployable"] = {
            "copy": {
                "task": "copy",
                "package": "grunt-contrib-copy",
                "deployables": {
                    "files": "<%= config.deployables.files %>"
                }
            }
        };

        Create.save('build.json', result);
    }

    public static deploy(config) {
        var result = {}
        Create.save('deploy.json', result);
    }
}